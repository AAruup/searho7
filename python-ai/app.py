import json
import os
import time
from collections import defaultdict
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS
from google import genai
from google.genai import types

from agent_core import build_prompt, create_local_answer, describe_skills

try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth
    from firebase_admin import credentials as firebase_credentials
except Exception:
    firebase_admin = None
    firebase_auth = None
    firebase_credentials = None


APP_ORIGINS = [
    "https://searho7.web.app",
    "https://searho7.firebaseapp.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]

MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
WINDOW_SECONDS = 10 * 60
WINDOW_LIMIT = int(os.getenv("SEA_RHO7_WINDOW_LIMIT", "10"))
GLOBAL_DAILY_LIMIT = int(os.getenv("SEA_RHO7_GLOBAL_DAILY_LIMIT", "300"))
SIGNED_IN_DAILY_LIMIT = int(os.getenv("SEA_RHO7_SIGNED_IN_DAILY_LIMIT", "50"))
GUEST_DAILY_LIMIT = int(os.getenv("SEA_RHO7_GUEST_DAILY_LIMIT", "15"))

rate_windows = {}
daily_counts = defaultdict(int)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": APP_ORIGINS}})


def init_firebase_admin():
    if firebase_admin is None:
        return
    if firebase_admin._apps:
        return

    options = {}
    project_id = os.getenv("FIREBASE_PROJECT_ID", "").strip() or os.getenv("GOOGLE_CLOUD_PROJECT", "").strip()
    if project_id:
        options["projectId"] = project_id

    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()
    if service_account_json and firebase_credentials is not None:
        credential = firebase_credentials.Certificate(json.loads(service_account_json))
        firebase_admin.initialize_app(credential, options or None)
        return

    firebase_admin.initialize_app(options=options or None)


def day_key():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def verify_user():
    if os.getenv("ALLOW_UNVERIFIED_DEV", "").lower() == "true":
        return {
            "uid": "local-python-dev",
            "name": "Local Python Dev",
            "firebase": {"sign_in_provider": "custom"},
        }

    if firebase_auth is None:
        return None

    init_firebase_admin()
    header = request.headers.get("Authorization", "")
    prefix = "Bearer "
    if not header.startswith(prefix):
        return None

    try:
        return firebase_auth.verify_id_token(header[len(prefix):])
    except Exception:
        return None


def is_guest(decoded_user):
    return decoded_user.get("firebase", {}).get("sign_in_provider") == "anonymous"


def check_window_limit(uid):
    now = time.time()
    current = rate_windows.get(uid)
    if not current or now - current["started_at"] > WINDOW_SECONDS:
        rate_windows[uid] = {"started_at": now, "count": 1}
        return True

    if current["count"] >= WINDOW_LIMIT:
        return False

    current["count"] += 1
    return True


def check_daily_limit(decoded_user):
    key = day_key()
    uid = decoded_user["uid"]
    user_limit = GUEST_DAILY_LIMIT if is_guest(decoded_user) else SIGNED_IN_DAILY_LIMIT
    global_key = f"{key}:global"
    user_key = f"{key}:user:{uid}"

    if daily_counts[global_key] >= GLOBAL_DAILY_LIMIT:
        return False, "SEA.RHO7 reached today's beta AI limit. Try again tomorrow.", 0

    if daily_counts[user_key] >= user_limit:
        return False, f"You reached today's SEA.RHO7 beta AI limit of {user_limit} messages.", 0

    daily_counts[global_key] += 1
    daily_counts[user_key] += 1
    return True, "", user_limit - daily_counts[user_key]


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "sea-rho7-python-ai",
        "model": MODEL,
        "brain": "sea-rho7-agent-core",
    })


@app.get("/api/skills")
def skills():
    return jsonify({
        "service": "sea-rho7-python-ai",
        "skills": describe_skills(),
    })


@app.get("/api/demo")
def demo():
    if os.getenv("ALLOW_UNVERIFIED_DEV", "").lower() != "true":
        return jsonify({"error": "Demo endpoint is only available in local dev mode."}), 403

    question = request.args.get("question", "teach pythagoras").strip()
    decoded_user = {
        "uid": "local-python-dev",
        "name": request.args.get("userName", "Arup"),
        "firebase": {"sign_in_provider": "custom"},
    }
    body = {
        "question": question,
        "userName": decoded_user["name"],
        "mode": "local-browser-demo",
        "roomId": "python-demo",
    }
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    if not api_key:
        return jsonify({
            "text": create_local_answer(question),
            "source": "python-local",
            "model": "sea-rho7-agent-core",
            "warning": "GEMINI_API_KEY is not configured.",
        })

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=MODEL,
            contents=build_prompt(body, decoded_user),
            config=types.GenerateContentConfig(
                max_output_tokens=900,
                temperature=0.55,
                thinking_config=types.ThinkingConfig(thinking_budget=0),
            ),
        )
        return jsonify({
            "text": response.text or "",
            "source": "python-flask-demo",
            "model": MODEL,
        })
    except Exception:
        app.logger.exception("SEA.RHO7 demo Gemini call failed")
        return jsonify({
            "text": create_local_answer(question),
            "source": "python-local-fallback",
            "model": "sea-rho7-agent-core",
            "warning": "Gemini did not answer, so SEA.RHO7 used its Python fallback brain.",
        })


@app.post("/api/ask")
def ask():
    decoded_user = verify_user()
    if not decoded_user:
        return jsonify({"error": "Please sign in before using SEA.RHO7 AI."}), 401

    uid = decoded_user["uid"]
    if not check_window_limit(uid):
        return jsonify({"error": "SEA.RHO7 is cooling down for this account. Try again in a few minutes."}), 429

    body = request.get_json(silent=True) or {}
    question = str(body.get("question", "")).strip()
    if not question:
        return jsonify({"error": "Ask SEA.RHO7 one question first."}), 400

    if len(question) > 5000:
        return jsonify({"error": "Please keep one question under 5000 characters."}), 400

    ok, limit_message, remaining = check_daily_limit(decoded_user)
    if not ok:
        return jsonify({"error": limit_message}), 429

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return jsonify({
            "text": create_local_answer(question),
            "source": "python-local",
            "model": "sea-rho7-agent-core",
            "remainingToday": remaining,
            "warning": "GEMINI_API_KEY is not configured.",
        })

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=MODEL,
            contents=build_prompt(body, decoded_user),
            config=types.GenerateContentConfig(
                max_output_tokens=900,
                temperature=0.55,
                thinking_config=types.ThinkingConfig(thinking_budget=0),
            ),
        )
        return jsonify({
            "text": response.text or "",
            "source": "python-flask",
            "model": MODEL,
            "remainingToday": remaining,
        })
    except Exception:
        app.logger.exception("SEA.RHO7 Gemini call failed")
        return jsonify({
            "text": create_local_answer(question),
            "source": "python-local-fallback",
            "model": "sea-rho7-agent-core",
            "remainingToday": remaining,
            "warning": "Gemini did not answer, so SEA.RHO7 used its Python fallback brain.",
        })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("PORT", "5050")), debug=True)

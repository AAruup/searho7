# SEA.RHO7 Python AI Backend

This is an optional Flask backend for SEA.RHO7. It helps if you want to learn Python or host the AI brain outside Firebase Functions.

It does not remove the need for a real hosted server. A public app still needs the Gemini key hidden on a backend, not inside browser code.

## Local Test

From the project root, run:

```powershell
.\start-python-ai.bat
```

The local backend starts at:

```text
http://127.0.0.1:5050/api/health
```

The independent Python brain lives in:

```text
agent_core.py
```

That file controls SEA.RHO7's identity, skills, prompt style, and local fallback answers.

Useful local checks:

```text
http://127.0.0.1:5050/api/health
http://127.0.0.1:5050/api/skills
```

For local-only testing, the script uses `ALLOW_UNVERIFIED_DEV=true`, so it does not require Firebase login tokens.

## Connect SEA.RHO7 To A Hosted Flask URL

After hosting this Flask app on a public HTTPS URL, set this before building the React app:

```env
VITE_SEA_RHO7_AI_MODE="paid-backend"
VITE_SEA_RHO7_AI_ENDPOINT="https://your-python-backend.example.com/api/ask"
```

Then build and deploy Hosting again.

## Railway Deploy

Railway is a good beginner-friendly host for this backend.

1. Push this project to GitHub.
2. In Railway, create a new project from the GitHub repo.
3. Set the service root directory to:

```text
/python-ai
```

4. Add this private Railway variable:

```text
GEMINI_API_KEY=your_real_key_here
FIREBASE_PROJECT_ID=searho7
```

5. Do not add `ALLOW_UNVERIFIED_DEV` on Railway.
6. Let Railway deploy. The health check is:

```text
/api/health
```

7. Copy the public Railway URL, then set the React app endpoint:

```env
VITE_SEA_RHO7_AI_MODE="paid-backend"
VITE_SEA_RHO7_AI_ENDPOINT="https://your-railway-url.up.railway.app/api/ask"
```

8. Rebuild and redeploy Firebase Hosting.

You can do step 7 and 8 from the project root with:

```powershell
.\connect-railway-ai.bat
```

Paste the Railway public URL when it asks.

If Firebase login tokens are rejected on Railway, add one more private Railway variable with your Firebase service account JSON:

```text
FIREBASE_SERVICE_ACCOUNT_JSON={...}
```

Most early tests should try `FIREBASE_PROJECT_ID=searho7` first.

## Live Safety

For real students, keep Firebase token verification enabled. Do not set `ALLOW_UNVERIFIED_DEV=true` on a public server.

The backend has small beta limits:

- Guest users: 15 AI messages per day
- Signed-in users: 50 AI messages per day
- Whole beta: 300 AI messages per day
- Burst limit: 10 messages per 10 minutes

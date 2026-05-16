const { GoogleGenAI } = require("@google/genai");
const admin = require("firebase-admin");
const { defineSecret } = require("firebase-functions/params");
const { onRequest } = require("firebase-functions/v2/https");

admin.initializeApp();

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");
const flashModel = "gemini-3.1-flash-lite";
const rateWindows = new Map();
const dailyGlobalLimit = 300;
const dailySignedInLimit = 50;
const dailyGuestLimit = 15;

const allowedOrigins = new Set([
  "https://searho7.web.app",
  "https://searho7.firebaseapp.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);

function applyCors(req, res) {
  const origin = req.get("origin") || "";
  const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
  if (allowedOrigins.has(origin) || isLocalhost) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
  }
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

function readBody(req) {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body || {};
}

async function verifyUser(req) {
  const header = req.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  try {
    return await admin.auth().verifyIdToken(match[1]);
  } catch {
    return null;
  }
}

function checkRateLimit(uid) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 10;
  const current = rateWindows.get(uid);

  if (!current || now - current.startedAt > windowMs) {
    rateWindows.set(uid, { startedAt: now, count: 1 });
    return true;
  }

  if (current.count >= maxRequests) return false;
  current.count += 1;
  return true;
}

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function isGuestUser(decodedUser) {
  return decodedUser.firebase?.sign_in_provider === "anonymous";
}

async function checkDailyLimit(decodedUser) {
  const db = admin.firestore();
  const key = dayKey();
  const globalRef = db.collection("_seaRho7Usage").doc(key);
  const userRef = globalRef.collection("users").doc(decodedUser.uid);
  const userLimit = isGuestUser(decodedUser) ? dailyGuestLimit : dailySignedInLimit;

  return db.runTransaction(async (transaction) => {
    const [globalSnap, userSnap] = await Promise.all([
      transaction.get(globalRef),
      transaction.get(userRef),
    ]);

    const globalCount = Number(globalSnap.get("count") || 0);
    const userCount = Number(userSnap.get("count") || 0);

    if (globalCount >= dailyGlobalLimit) {
      return {
        ok: false,
        message: "SEA.RHO7 reached today's beta AI limit. Try again tomorrow.",
      };
    }

    if (userCount >= userLimit) {
      return {
        ok: false,
        message: `You reached today's SEA.RHO7 beta AI limit of ${userLimit} messages.`,
      };
    }

    transaction.set(globalRef, {
      count: admin.firestore.FieldValue.increment(1),
      limit: dailyGlobalLimit,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    transaction.set(userRef, {
      uid: decodedUser.uid,
      email: decodedUser.email || "",
      isGuest: isGuestUser(decodedUser),
      count: admin.firestore.FieldValue.increment(1),
      limit: userLimit,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return {
      ok: true,
      remaining: userLimit - userCount - 1,
    };
  });
}

function buildPrompt(body, decodedUser) {
  const question = String(body.question || "").trim();
  const mode = String(body.mode || "general");
  const roomId = String(body.roomId || "dashboard");
  const userName = String(body.userName || decodedUser.name || "student");
  const context = String(body.context || "");

  return [
    "You are SEA.RHO7, a daily-life AI problem solver for students, creators, builders, and families.",
    "Answer directly first. Do not only ask for more details.",
    "If details are missing, give the best useful first answer, then ask one short follow-up question.",
    "For study topics, teach with: simple meaning, key ideas, formula if needed, example, and one practice question.",
    "For coding or app problems, give a practical fix path and the next smallest action.",
    "For lyrics or animation, give visual timing, mood, movement, color, and export advice.",
    "For health, legal, money, or safety topics, be careful, general, and recommend a qualified professional when needed.",
    "Use warm simple language. Avoid fake metrics, fake people, empty planning, and dramatic sci-fi words.",
    `User name: ${userName}`,
    `Signed in user id: ${decodedUser.uid}`,
    `Mode: ${mode}`,
    `Room: ${roomId}`,
    context ? `Context:\n${context}` : "",
    `User request:\n${question}`,
  ].filter(Boolean).join("\n");
}

exports.api = onRequest(
  {
    region: "us-central1",
    secrets: [GEMINI_API_KEY],
    timeoutSeconds: 60,
    maxInstances: 1,
  },
  async (req, res) => {
    applyCors(req, res);

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method === "GET") {
      res.json({ status: "ok", service: "sea-rho7-ai" });
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Use POST to ask SEA.RHO7." });
      return;
    }

    const decodedUser = await verifyUser(req);
    if (!decodedUser) {
      res.status(401).json({ error: "Please sign in before using SEA.RHO7 AI." });
      return;
    }

    if (!checkRateLimit(decodedUser.uid)) {
      res.status(429).json({ error: "SEA.RHO7 is cooling down for this account. Try again in a few minutes." });
      return;
    }

    const body = readBody(req);
    const question = String(body.question || "").trim();
    if (!question) {
      res.status(400).json({ error: "Ask SEA.RHO7 one question first." });
      return;
    }

    if (question.length > 5000) {
      res.status(400).json({ error: "Please keep one question under 5000 characters." });
      return;
    }

    const dailyLimit = await checkDailyLimit(decodedUser);
    if (!dailyLimit.ok) {
      res.status(429).json({ error: dailyLimit.message });
      return;
    }

    const apiKey = GEMINI_API_KEY.value() || process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      res.status(500).json({ error: "SEA.RHO7 AI key is not configured." });
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: flashModel,
        contents: buildPrompt(body, decodedUser),
        config: {
          maxOutputTokens: 900,
          temperature: 0.55,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      });

      res.json({
        text: response.text || "",
        source: "firebase-functions",
        model: flashModel,
        remainingToday: dailyLimit.remaining,
      });
    } catch (error) {
      console.error("SEA.RHO7 Gemini call failed", error);
      res.status(500).json({ error: "SEA.RHO7 could not reach Gemini right now." });
    }
  }
);

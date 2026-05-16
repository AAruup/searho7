import express from "express";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import path from "path";

const flashModel = "gemini-3-flash-preview";

function loadLocalEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").trim().replace(/^['"]|['"]$/g, "");
    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.API_KEY ||
    "";
}

function buildSeaRho7ServerPrompt(body: any) {
  const question = String(body?.question || "").trim();
  const mode = String(body?.mode || "general");
  const roomId = String(body?.roomId || "dashboard");
  const userName = String(body?.userName || "student");
  const context = String(body?.context || "");

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
    `Mode: ${mode}`,
    `Room: ${roomId}`,
    context ? `Context:\n${context}` : "",
    `User request:\n${question}`,
  ].filter(Boolean).join("\n");
}

async function startServer() {
  loadLocalEnvFile();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));
  app.post("/api/ask", async (req, res) => {
    const question = String(req.body?.question || "").trim();
    if (!question) {
      res.status(400).json({ error: "Ask SEA.RHO7 one question first." });
      return;
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "undefined") {
      res.status(503).json({ error: "Gemini key is not configured on the server." });
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: flashModel,
        contents: buildSeaRho7ServerPrompt(req.body),
      });

      res.json({
        text: response.text || "",
        source: "local-server",
      });
    } catch (error) {
      console.error("SEA.RHO7 local AI endpoint failed:", error);
      res.status(500).json({ error: "SEA.RHO7 could not reach Gemini from the server." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      configLoader: "native",
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical server startup error:", err);
  process.exit(1);
});

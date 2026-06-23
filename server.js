import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- Config from environment ----
const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS || "2000", 10);
const PORT = parseInt(process.env.PORT || "3000", 10);

const app = express();
app.use(express.json({ limit: "1mb" }));

const getSystemPrompt = (direction) => {
  const fromLang = direction === "es-en" ? "Spanish" : "English";
  const toLang = direction === "es-en" ? "English" : "Spanish";
  return `You are an expert Spanish-English language teacher and translator. The user will give you text in ${fromLang}. Translate it to ${toLang} and provide a detailed breakdown.

Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "original": "the original text",
  "translation": "the translated text",
  "detectedLanguage": "${fromLang.toLowerCase()}",
  "wordBreakdown": [
    { "original": "word", "translation": "word meaning", "partOfSpeech": "noun/verb/adjective/etc" }
  ],
  "grammarNotes": [
    "Grammar note 1 about sentence structure or rules",
    "Grammar note 2"
  ],
  "tenseInfo": "Explanation of the verb tense(s) used, or 'No verbs detected' if none",
  "sentenceStructure": "Explanation of the sentence structure (e.g., Subject + Verb + Object) and how it compares between the two languages",
  "tips": "One helpful tip for a Spanish learner about this phrase or a common mistake to avoid"
}`;
};

// ---- Translation endpoint (key stays server-side) ----
app.post("/api/translate", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set on the server." });
  }
  const { text, direction } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "No text provided." });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: getSystemPrompt(direction),
        messages: [{ role: "user", content: text }],
      }),
    });

    const data = await r.json();

    if (data.error) {
      return res.status(502).json({ error: data.error.message || "Anthropic API error" });
    }

    const raw = (data.content || []).map((i) => i.text || "").join("");
    const clean = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error("Could not parse model response. Stop reason:", data.stop_reason, "\nRaw:", raw);
      const hint = data.stop_reason === "max_tokens" ? " (response was truncated, try raising MAX_TOKENS)" : "";
      return res.status(502).json({ error: `Could not parse model response.${hint}` });
    }

    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
});

// ---- Health check ----
app.get("/api/health", (req, res) => {
  res.json({ ok: true, model: MODEL, keyConfigured: Boolean(API_KEY) });
});

// ---- Serve the built frontend ----
app.use(express.static(path.join(__dirname, "dist")));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Spanish Translator listening on :${PORT}`);
  console.log(`Model: ${MODEL} | API key configured: ${Boolean(API_KEY)}`);
});

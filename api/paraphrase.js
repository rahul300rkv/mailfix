// POST /api/paraphrase — paraphrasing tool (NVIDIA NIM). Replaces the Netlify function.
const { callNim, getClientIP, parseBody } = require("./_nim");

const requests = new Map();
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 20;

const MODE_INSTRUCTIONS = {
  standard: "Naturally rewrite the text while preserving its exact meaning and important details.",
  fluency:  "Improve grammar, readability, sentence flow, vocabulary and naturalness while preserving the original meaning.",
  formal:   "Rewrite the text in a professional, formal, polished and appropriate style while preserving the original meaning.",
  simple:   "Rewrite the text using simple, clear, easy-to-understand language while preserving the original meaning.",
  creative: "Rewrite the text in an engaging, natural, varied and expressive style while preserving the original meaning."
};

// Note: in-memory limit is per serverless instance (best-effort, same as before).
function checkRateLimit(ip) {
  const now = Date.now();
  const existing = requests.get(ip);
  if (!existing || now - existing.start > WINDOW_MS) {
    requests.set(ip, { start: now, count: 1 });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }
  if (existing.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((WINDOW_MS - (now - existing.start)) / 1000) };
  }
  existing.count++;
  return { allowed: true, remaining: MAX_REQUESTS - existing.count };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  if (!process.env.NVIDIA_API_KEY) {
    return res.status(500).json({ error: "API key not configured." });
  }

  const rateLimit = checkRateLimit(getClientIP(req));
  if (!rateLimit.allowed) {
    res.setHeader("Retry-After", String(rateLimit.retryAfter));
    return res.status(429).json({ error: "Too many requests. Please try again in an hour." });
  }

  const body = parseBody(req);
  if (!body) return res.status(400).json({ error: "Invalid request." });

  const { text, mode = "standard", language = "English" } = body;
  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Please enter some text." });
  }
  if (text.trim().length > 2000) {
    return res.status(400).json({ error: "Maximum 2,000 characters allowed per request." });
  }

  const instruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.standard;
  const lang = String(language).slice(0, 40);

  const prompt = `You are an expert multilingual paraphrasing assistant.

Your task is to paraphrase the user's text.

STYLE:
${instruction}

OUTPUT LANGUAGE:
${lang}

IMPORTANT RULES:
- Preserve the original meaning.
- Do not invent facts or add unsupported information.
- Do not remove important information.
- Do not summarize unless the original text itself is a summary.
- Do not explain your changes or mention you are an AI.
- Do not put the answer inside quotation marks.
- Return ONLY the paraphrased text.
- Keep approximately the same level of detail.
- Make the result natural and readable.

TEXT TO PARAPHRASE:

${text.trim()}`;

  try {
    const { status, data } = await callNim({
      messages: [
        { role: "system", content: "You are a professional multilingual paraphrasing assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    if (status < 200 || status >= 300) {
      console.error("NIM ERROR", status, JSON.stringify(data));
      return res.status(502).json({ error: "AI service error. Please try again." });
    }

    const paraphrased = data?.choices?.[0]?.message?.content?.trim();
    if (!paraphrased) {
      return res.status(500).json({ error: "No result generated. Please try again." });
    }
    return res.status(200).json({ paraphrased, remainingRequests: rateLimit.remaining });
  } catch (err) {
    console.error("NIM FETCH FAILED", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};

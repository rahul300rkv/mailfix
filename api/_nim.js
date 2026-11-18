// Shared helper for NVIDIA NIM (OpenAI-compatible) chat completions.
// Env vars (Vercel → Project → Settings → Environment Variables):
//   NVIDIA_API_KEY  (required) – key from build.nvidia.com (starts with "nvapi-")
//   NVIDIA_MODEL    (optional) – ONE model id, or a comma-separated fallback chain.
//
// Why a chain: NVIDIA's free catalog changes (models get retired or go
// temporarily "unavailable"). If a model returns 404/410/429/5xx we silently
// try the next one, so the site keeps working without a redeploy.
// Only plain *instruct* models are used on purpose – "reasoning" models print
// long <think> text first and would burn the small max_tokens used by these tools.
const NIM_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const DEFAULT_MODELS = [
  "meta/llama-3.3-70b-instruct",      // primary: strong Hindi/Hinglish + English, stable
  "google/gemma-4-31b-it",            // fallback 1: strong multilingual
  "mistralai/mistral-large-2-instruct", // fallback 2
  "meta/llama-3.1-8b-instruct"        // last resort: fast, small
];

function modelChain() {
  const env = (process.env.NVIDIA_MODEL || "").split(",").map(m => m.trim()).filter(Boolean);
  return env.length ? env : DEFAULT_MODELS;
}

// Remove any <think>…</think> block a model might emit.
function cleanText(t) {
  return String(t || "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

async function callNim({ messages, max_tokens = 500, temperature = 0.6 }) {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) {
    return { status: 500, data: { error: { message: "API key not configured." } } };
  }
  let last = { status: 502, data: { error: { message: "No model available." } } };
  for (const model of modelChain()) {
    try {
      const response = await fetch(NIM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": "Bearer " + key
        },
        body: JSON.stringify({ model, messages, max_tokens, temperature, stream: false })
      });
      let data;
      try { data = await response.json(); } catch { data = {}; }
      if (response.ok) {
        const msg = data && data.choices && data.choices[0] && data.choices[0].message;
        if (msg && typeof msg.content === "string") msg.content = cleanText(msg.content);
        if (msg && msg.content) return { status: 200, data };
        last = { status: 502, data: { error: { message: "Empty response." } } };
        continue; // empty output -> try next model
      }
      last = { status: response.status, data };
      // Bad key / bad request won't be fixed by another model
      if (response.status === 401 || response.status === 400) return last;
      console.error("NIM model failed:", model, response.status);
    } catch (err) {
      console.error("NIM fetch error:", model, err);
      last = { status: 502, data: { error: { message: "Network error." } } };
    }
  }
  return last;
}

function getClientIP(req) {
  const fwd = req.headers["x-forwarded-for"] || req.headers["x-real-ip"];
  if (fwd) return String(fwd).split(",")[0].trim();
  return "unknown";
}

function parseBody(req) {
  const b = req.body;
  if (b && typeof b === "object") return b;
  if (typeof b === "string") { try { return JSON.parse(b); } catch { return null; } }
  return null;
}

module.exports = { callNim, getClientIP, parseBody };

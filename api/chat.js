// POST /api/chat — generic AI proxy used by the email, job, resignation,
// sarkari-letter and WhatsApp tools. Replaces the old Netlify "groq" function.
const { callNim, parseBody } = require("./_nim");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: { message: "Method Not Allowed" } });
  }

  const body = parseBody(req);
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return res.status(400).json({ error: { message: "Invalid request." } });
  }

  // Only forward whitelisted fields (the endpoint is public).
  const messages = body.messages.slice(0, 6).map(m => ({
    role: ["system", "user", "assistant"].includes(m && m.role) ? m.role : "user",
    content: String((m && m.content) || "").slice(0, 6000)
  }));
  const max_tokens = Math.min(Math.max(parseInt(body.max_tokens) || 500, 1), 1000);
  const temperature = Math.min(Math.max(Number(body.temperature) || 0.6, 0), 1.2);

  try {
    const { status, data } = await callNim({ messages, max_tokens, temperature });
    if (status < 200 || status >= 300) {
      console.error("NIM ERROR", status, JSON.stringify(data));
      const code = status === 401 || status === 403 ? 500 : status;
      return res.status(code).json({ error: { message: "AI service error. Please try again." } });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error("NIM FETCH FAILED", err);
    return res.status(500).json({ error: { message: "Something went wrong. Please try again." } });
  }
};

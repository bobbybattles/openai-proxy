import express from "express";
import fetch from "node-fetch";
const app = express();
app.use(express.json());
const OPENAI_KEY = process.env.OPENAI_API_KEY;

// Original assess endpoint
app.post("/assess", async (req, res) => {
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: req.body.model,
        messages: req.body.messages
      })
    });
    const json = await resp.json();
    res.json(json);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// New assess-gpt endpoint that uses your Custom GPT spec
async function getGptSpec(gptId) {
  const response = await fetch(`https://api.openai.com/v1/gpts/${gptId}`, {
    headers: { "Authorization": `Bearer ${OPENAI_KEY}` }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch GPT spec: ${response.statusText}`);
  }
  return response.json();  // { model: "...", messages: [ ... ] }
}

app.post("/assess-gpt", async (req, res) => {
  try {
    const { gptId, productData } = req.body;
    const spec = await getGptSpec(gptId);
    // Build messages array: original spec messages + user data
    const messages = [
      ...spec.messages,
      { role: "user", content: JSON.stringify(productData) }
    ];

    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: spec.model,
        messages: messages
      })
    });
    const apiJson = await apiRes.json();
    res.json(apiJson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));

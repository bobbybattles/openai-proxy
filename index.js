import express from "express";
import fetch from "node-fetch";
const app = express();
app.use(express.json());
const OPENAI_KEY = process.env.OPENAI_API_KEY;

app.post("/assess", async (req, res) => {
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
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));

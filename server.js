import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// === API ENDPOINT ===
app.post("/api/generate-itinerary", async (req, res) => {
  const { destination, startDate, endDate, interests, budget } = req.body;
  if (!destination) return res.status(400).json({ error: "Destination required" });

  const prompt = `
  You are TripBot, an AI travel planner for Indian tourism.
  Plan a short itinerary in JSON format for:
  destination: ${destination}
  dates: ${startDate} - ${endDate}
  interests: ${interests}
  budget: ${budget}

  Return ONLY JSON like:
  {
    "destination": "string",
    "summary": "short text",
    "days": [
      {"day":1,"title":"string","activities":["a","b","c"]},
      {"day":2,"title":"string","activities":["a","b","c"]}
    ],
    "estimatedCost":"₹amount"
  }`;

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful travel assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 600
      })
    });
    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content ?? "{}";
    const itinerary = JSON.parse(text);
    res.json(itinerary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate itinerary" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TripBot API running on ${PORT}`));

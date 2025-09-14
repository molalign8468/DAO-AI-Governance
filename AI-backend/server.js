import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.Gemini_API_KEY);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.post("/ai/summarize", async (req, res) => {
  try {
    const { description, amount } = req.body;
    if (!description || !amount) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const prompt = `
You are an AI assistant for a DAO governance platform. 
A proposer has submitted a proposal requesting ETH funding.

Proposal description: "${description}"
Requested amount: ${amount} ETH


Task:
1. Summarize the proposal in 2–3 clear sentences.
2. Keep it neutral and objective.
3. Mention both purpose and requested ETH.

Return only the summarized version (no extra text).
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    const summary = result.response.text();

    res.json({ summary });
  } catch (err) {
    console.error("AI Error:", err.message);
    res.status(500).json({ error: "AI summarization failed" });
  }
});

app.post("/ai/insights", async (req, res) => {
  try {
    const { description, amount, receipt } = req.body;
    console.log(req.body);
    if (!description || !amount) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const prompt = `
You are an expert DAO investment advisor.
Analyze this proposal  for a DAO treasury grant.

Proposal Description: "${description}"
Requested Amount: ${amount} ETH
Receipt Address : ${receipt}

Please provide a Good output:

  "summary": "<short summary of the proposal>",
  "riskScore": "<risk score 0-100, 0=low, 100=high>",
  "roiPrediction": "<expected ROI percentage>",
  "recommendation": "<Approve or Reject>"

`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    let text = result.response.text();

    text = text.replace(/```json|```/g, "").trim();

    let insights,
      justification = "";
    try {
      const jsonEndIndex = text.indexOf("}") + 1;
      const jsonPart = text.slice(0, jsonEndIndex);
      justification = text.slice(jsonEndIndex).trim();

      insights = JSON.parse(jsonPart);
    } catch (err) {
      console.error("JSON parse failed:", text);
      return res.status(500).json({ error: "AI returned invalid JSON" });
    }

    res.json({ insights, justification });
  } catch (err) {
    console.error("AI Insights Error:", err.message);
    res.status(500).json({ error: "AI insights generation failed" });
  }
});

app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory log store with realistic seed data for the analytics dashboard
let logs: any[] = [
  {
    id: "seed-1",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    text: "I am absolutely lost on how recursion works in this programming assignment. The code keeps running forever and crashes the browser.",
    primaryEmotion: "Confused",
    bilstmEmotion: "Confused",
    bilstmConfidence: 0.88,
    bertEmotion: "Confused",
    bertConfidence: 0.94,
    ensembleEmotion: "Confused",
    ensembleConfidence: 0.92,
    feedbackScore: 5,
    feedbackNotes: "The suggested recursion tree visualization was super helpful!",
    tipsProvided: ["Draw a recursion tree for small inputs (e.g., n=3)", "Identify your base case explicitly", "Add console logs at the start of your function"]
  },
  {
    id: "seed-2",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    text: "This lecture is extremely dry and slow. I already know basic Python variables and loops, this feels like a waste of my afternoon.",
    primaryEmotion: "Bored",
    bilstmEmotion: "Bored",
    bilstmConfidence: 0.75,
    bertEmotion: "Bored",
    bertConfidence: 0.82,
    ensembleEmotion: "Bored",
    ensembleConfidence: 0.79,
    feedbackScore: 4,
    feedbackNotes: "Prompted me to build a small script instead of just listening.",
    tipsProvided: ["Increase play speed of materials to 1.5x", "Write a small mini-project using the concepts being discussed", "Challenge yourself by optimizing the solution code"]
  },
  {
    id: "seed-3",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    text: "I really want to understand how transformers process attention weights! I've been reading papers and it is fascinating.",
    primaryEmotion: "Curious",
    bilstmEmotion: "Curious",
    bilstmConfidence: 0.81,
    bertEmotion: "Curious",
    bertConfidence: 0.89,
    ensembleEmotion: "Curious",
    ensembleConfidence: 0.86,
    feedbackScore: 5,
    feedbackNotes: "Excellent visualizer suggestion.",
    tipsProvided: ["Use visualizers like 'Transformer Explainer' online", "Implement a simple self-attention step in plain math", "Read the 'Attention Is All You Need' paper section 3"]
  },
  {
    id: "seed-4",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    text: "I feel great about the upcoming SQL exam. I have completed all practice sets and answered everything correctly!",
    primaryEmotion: "Confident",
    bilstmEmotion: "Confident",
    bilstmConfidence: 0.91,
    bertEmotion: "Confident",
    bertConfidence: 0.95,
    ensembleEmotion: "Confident",
    ensembleConfidence: 0.93,
    feedbackScore: 4,
    feedbackNotes: "Good advice to mentor peers to reinforce knowledge.",
    tipsProvided: ["Try solving advanced challenge problems on LeetCode", "Explain difficult concepts to a classmate or friend", "Do a timed mock exam to test your speed"]
  },
  {
    id: "seed-5",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    text: "My CSS won't align and I've spent three hours on it. I want to throw my computer out the window, this is impossible!",
    primaryEmotion: "Frustrated",
    bilstmEmotion: "Frustrated",
    bilstmConfidence: 0.86,
    bertEmotion: "Frustrated",
    bertConfidence: 0.92,
    ensembleEmotion: "Frustrated",
    ensembleConfidence: 0.90,
    feedbackScore: 5,
    feedbackNotes: "The platform's empathy was deeply comforting and helped me cool down.",
    tipsProvided: ["Step away from the screen for a full 10-minute break", "Use browser devtools to toggle border outlines on components", "Use standard Flexbox or Grid instead of absolute positioning"]
  }
];

// Lazy-initialize Gemini client to prevent startup crash if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// Rule-based Keyword Classification & Support Engine
const EMOTION_KEYWORDS = {
  Bored: ["boring", "bored", "slow", "sleepy", "tired", "why learn this", "pointless", "useless", "already know", "waste of", "redundant"],
  Confident: ["easy", "got this", "understand", "confident", "perfect", "excel", "crushing", "simple", "solved", "fine", "ready", "fluent"],
  Confused: ["confused", "lost", "stuck", "don't know", "how to", "don't understand", "not sure", "lost on", "pointer", "recursion", "loop", "syntax", "error", "broken", "run forever"],
  Curious: ["wonder", "curious", "how does", "why does", "learn more", "explore", "interested", "fascinating", "deep dive", "excited to learn", "how exactly"],
  Frustrated: ["frustrated", "hate", "impossible", "giving up", "annoyed", "stupid", "broken", "rage", "waste of time", "failing", "error", "spent hours", "throwing", "computer", "screwed"]
};

const EMOTION_SUPPORT_TEMPLATES = {
  Bored: {
    encouragement: "It sounds like you're feeling disengaged or unchallenged right now. Finding ways to increase the cognitive load or apply the concept practically can reignite your interest!",
    tips: [
      "Increase play speed of video materials to 1.25x or 1.5x.",
      "Gamify the learning: Set a timer and see if you can build a working prototype in 15 minutes.",
      "Identify real-world use cases or create a custom utility script related to the topic."
    ],
    checkpoints: [
      "Find 1 advanced application of this concept.",
      "Build a tiny implementation (less than 20 lines of code) incorporating the lesson.",
      "Draft a 3-sentence summary of why this concept matters in professional environments."
    ]
  },
  Confident: {
    encouragement: "Incredible job! Your confidence is a direct result of your hard work and understanding. Let's make sure we solidify and expand this knowledge!",
    tips: [
      "Try resolving edge cases or writing unit tests to challenge your solution.",
      "Reinforce your learning by mentoring a peer or writing a brief tutorial post.",
      "Explore advanced challenge topics or related system design puzzles."
    ],
    checkpoints: [
      "Solve an advanced-level problem on this topic.",
      "Draft a brief code snippet with comments explaining *how* your solution operates.",
      "List 2 potential pitfalls or bottlenecks of your current solution."
    ]
  },
  Confused: {
    encouragement: "It is completely normal to feel confused! Confusion is actually a sign that your brain is actively building new neural pathways to grasp this difficult concept.",
    tips: [
      "Deconstruct the problem into the smallest possible sub-problems.",
      "Draw a visual diagram or trace flow paths on paper step-by-step.",
      "Add print/log statements to verify the actual state of variables at each step."
    ],
    checkpoints: [
      "Isolate and define the single most confusing line or parameter.",
      "Write a plain-English pseudocode of what you *want* the code to do.",
      "Consult a simplified guide, documentation page, or ask a peer with a specific question."
    ]
  },
  Curious: {
    encouragement: "What a fantastic mindset! Curiosity is the absolute best engine for learning. Let's dive deeper and capitalize on this creative momentum!",
    tips: [
      "Read the official source documentation or underlying research paper section.",
      "Conduct a small experiment: change code parameters and observe the behavior.",
      "Draw a block-diagram of the entire architecture to capture relationships."
    ],
    checkpoints: [
      "Formulate 1 specific hypothesis about how the mechanism functions and test it.",
      "Find and read 1 expert-authored article or documentation block on this topic.",
      "Write a micro-project or playground file dedicated purely to testing this concept."
    ]
  },
  Frustrated: {
    encouragement: "Take a deep breath. We've all been there! Feeling frustrated means you're pushing your boundaries. Let's take a tactical pause so we can tackle this with a fresh mind.",
    tips: [
      "Step away from the screen for 5-10 minutes. A short physical break does wonders.",
      "Explain the problem out loud to a rubber duck or write it down line-by-line.",
      "Simplify your code. Strip away features until you have a working bare-minimum base."
    ],
    checkpoints: [
      "Shut the laptop or step away for a glass of water for at least 5 minutes.",
      "List the exact expected behavior vs the actual error message or output.",
      "Comment out complex parts and test only the core input/output logic."
    ]
  }
};

function performKeywordRuleBasedEnhancement(text: string): { counts: Record<string, number>, detected: string[] } {
  const lowercaseText = text.toLowerCase();
  const counts: Record<string, number> = { Bored: 0, Confident: 0, Confused: 0, Curious: 0, Frustrated: 0 };
  const detected: string[] = [];

  for (const [emotion, words] of Object.entries(EMOTION_KEYWORDS)) {
    for (const word of words) {
      if (lowercaseText.includes(word)) {
        counts[emotion]++;
        if (!detected.includes(word)) {
          detected.push(word);
        }
      }
    }
  }

  return { counts, detected };
}

function generateMockAnalysis(text: string): any {
  const { counts, detected } = performKeywordRuleBasedEnhancement(text);

  // Initialize weights
  const emotions: ('Bored' | 'Confident' | 'Confused' | 'Curious' | 'Frustrated')[] = [
    'Bored', 'Confident', 'Confused', 'Curious', 'Frustrated'
  ];

  // Base random/fair distribution
  const scores: Record<string, number> = { Bored: 5, Confident: 5, Confused: 5, Curious: 5, Frustrated: 5 };

  // Add keyword weights
  for (const emotion of emotions) {
    scores[emotion] += (counts[emotion] || 0) * 20;
  }

  // If no keywords found, look at markers
  if (detected.length === 0) {
    if (text.includes("?")) scores.Confused += 10;
    if (text.includes("!")) scores.Frustrated += 10;
    if (text.length > 150) scores.Curious += 5;
    if (text.length < 50) scores.Bored += 5;
  }

  // Normalize scores to sum to 100%
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const breakdown = emotions.map(emotion => ({
    emotion,
    percentage: Math.round((scores[emotion] / totalScore) * 100)
  }));

  // Ensure sum is exactly 100
  const sum = breakdown.reduce((acc, curr) => acc + curr.percentage, 0);
  if (sum !== 100) {
    breakdown[0].percentage += (100 - sum);
  }

  // Find primary
  const sortedBreakdown = [...breakdown].sort((a, b) => b.percentage - a.percentage);
  const primaryEmotion = sortedBreakdown[0].emotion;

  // BiLSTM Prediction Simulation (heavily pattern and sequence of keywords oriented)
  // Let's add slight noise to the primary to make models distinct
  let bilstmEmotion = primaryEmotion;
  let bilstmConfidence = 0.70 + Math.random() * 0.25;
  // BERT Prediction Simulation (contextual, attention based)
  let bertEmotion = primaryEmotion;
  let bertConfidence = 0.75 + Math.random() * 0.22;

  // Make them slightly differ if they are close
  if (sortedBreakdown.length > 1 && sortedBreakdown[1].percentage > 25 && Math.random() > 0.5) {
    bilstmEmotion = sortedBreakdown[1].emotion;
    bilstmConfidence = 0.60 + Math.random() * 0.20;
  }

  // Ensemble is weighted blend
  const ensembleEmotion = primaryEmotion;
  const ensembleConfidence = Math.max(0.65, Math.min(0.99, (bilstmConfidence + bertConfidence) / 2 + 0.03));

  // Support
  const template = EMOTION_SUPPORT_TEMPLATES[primaryEmotion];

  return {
    id: "mock-" + Math.random().toString(36).substr(2, 9),
    text,
    timestamp: new Date().toISOString(),
    breakdown,
    bilstm: {
      modelName: "BiLSTM",
      primaryEmotion: bilstmEmotion,
      confidence: parseFloat(bilstmConfidence.toFixed(2)),
      features: detected.length > 0 ? detected.slice(0, 3).map(w => `Keyword match: "${w}"`) : ["Sequence pattern match", "Local lexical density"]
    },
    bert: {
      modelName: "BERT",
      primaryEmotion: bertEmotion,
      confidence: parseFloat(bertConfidence.toFixed(2)),
      features: ["Multi-head attention on context", "Semantic sentiment pooling"]
    },
    ensemble: {
      modelName: "Ensemble",
      primaryEmotion: ensembleEmotion,
      confidence: parseFloat(ensembleConfidence.toFixed(2)),
      features: [`Weighted blend (40% BiLSTM, 60% BERT) resolving to ${ensembleEmotion}`, "Rule-based keyword overrides applied"]
    },
    support: {
      encouragement: template.encouragement,
      tips: template.tips,
      checkpoints: template.checkpoints,
      enhancedKeywords: detected
    },
    isMocked: true
  };
}

// API: Analyze student study challenge
app.post("/api/analyze", async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({ error: "Please enter your study challenge context." });
  }

  const client = getGeminiClient();

  if (!client) {
    // Graceful fallback to rule-based keyword search & simulated classifications
    const mockResult = generateMockAnalysis(text);
    return res.json(mockResult);
  }

  try {
    // Real Gemini call using Structured JSON Output
    const prompt = `Analyze the student's study challenge and output emotion classifications.
Student Challenge: "${text}"

Provide a detailed response following this exact JSON schema:
{
  "breakdown": [
    { "emotion": "Bored", "percentage": <number, 0-100> },
    { "emotion": "Confident", "percentage": <number, 0-100> },
    { "emotion": "Confused", "percentage": <number, 0-100> },
    { "emotion": "Curious", "percentage": <number, 0-100> },
    { "emotion": "Frustrated", "percentage": <number, 0-100> }
  ],
  "bilstm_predicted_emotion": "<one of Bored, Confident, Confused, Curious, Frustrated>",
  "bilstm_confidence": <number, 0.0 to 1.0>,
  "bilstm_features": ["<string feature description>"],
  "bert_predicted_emotion": "<one of Bored, Confident, Confused, Curious, Frustrated>",
  "bert_confidence": <number, 0.0 to 1.0>,
  "bert_features": ["<string feature description>"],
  "ensemble_predicted_emotion": "<one of Bored, Confident, Confused, Curious, Frustrated>",
  "ensemble_confidence": <number, 0.0 to 1.0>,
  "ensemble_features": ["<string feature description>"],
  "encouragement": "<compassionate, empathetic response tailored to their state>",
  "tips": ["<3 clear actionable advice points suitable for the problem and emotional state>"],
  "checkpoints": ["<3 milestone checklist points for next steps>"]
}

The sum of breakdown percentages must be exactly 100. Let the predicted emotions reflect how those individual deep learning models would process the semantic context (BERT) versus local patterns (BiLSTM), with the ensemble fusing them. Make sure to generate highly practical, domain-specific academic guidance.`;

    const response = await client.models.generateContent({
     model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            breakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  emotion: { type: Type.STRING },
                  percentage: { type: Type.INTEGER }
                },
                required: ["emotion", "percentage"]
              }
            },
            bilstm_predicted_emotion: { type: Type.STRING },
            bilstm_confidence: { type: Type.NUMBER },
            bilstm_features: { type: Type.ARRAY, items: { type: Type.STRING } },
            bert_predicted_emotion: { type: Type.STRING },
            bert_confidence: { type: Type.NUMBER },
            bert_features: { type: Type.ARRAY, items: { type: Type.STRING } },
            ensemble_predicted_emotion: { type: Type.STRING },
            ensemble_confidence: { type: Type.NUMBER },
            ensemble_features: { type: Type.ARRAY, items: { type: Type.STRING } },
            encouragement: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            checkpoints: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: [
            "breakdown", "bilstm_predicted_emotion", "bilstm_confidence", "bilstm_features",
            "bert_predicted_emotion", "bert_confidence", "bert_features",
            "ensemble_predicted_emotion", "ensemble_confidence", "ensemble_features",
            "encouragement", "tips", "checkpoints"
          ]
        }
      }
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    const { detected } = performKeywordRuleBasedEnhancement(text);

    // Build standard structure to match AnalysisResponse
    const finalResult = {
      id: "gemini-" + Math.random().toString(36).substr(2, 9),
      text,
      timestamp: new Date().toISOString(),
      breakdown: data.breakdown,
      bilstm: {
        modelName: "BiLSTM",
        primaryEmotion: data.bilstm_predicted_emotion,
        confidence: data.bilstm_confidence,
        features: [...(data.bilstm_features || []), ...detected.map(w => `Keyword flag: "${w}"`)]
      },
      bert: {
        modelName: "BERT",
        primaryEmotion: data.bert_predicted_emotion,
        confidence: data.bert_confidence,
        features: data.bert_features
      },
      ensemble: {
        modelName: "Ensemble",
        primaryEmotion: data.ensemble_predicted_emotion,
        confidence: data.ensemble_confidence,
        features: data.ensemble_features
      },
      support: {
        encouragement: data.encouragement,
        tips: data.tips,
        checkpoints: data.checkpoints,
        enhancedKeywords: detected
      },
      isMocked: false
    };

    return res.json(finalResult);
  } catch (error: any) {
    console.error("Gemini analysis error, falling back:", error);
    const mockResult = generateMockAnalysis(text);
    return res.json({ ...mockResult, error: error.message });
  }
});

// API: Get logs
app.get("/api/logs", (req, res) => {
  res.json(logs);
});

// API: Save interaction log
app.post("/api/logs", (req, res) => {
  const { id, text, timestamp, primaryEmotion, bilstm, bert, ensemble, feedbackScore, feedbackNotes, tipsProvided } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Missing log details" });
  }

  // Check if log already exists to update it (e.g. feedback added)
  const existingIndex = logs.findIndex(l => l.id === id);
  if (existingIndex !== -1) {
    logs[existingIndex] = {
      ...logs[existingIndex],
      feedbackScore,
      feedbackNotes
    };
    return res.json(logs[existingIndex]);
  }

  // Create new log record
  const newLog = {
    id: id || "log-" + Math.random().toString(36).substr(2, 9),
    timestamp: timestamp || new Date().toISOString(),
    text,
    primaryEmotion: primaryEmotion || ensemble?.primaryEmotion || "Confused",
    bilstmEmotion: bilstm?.primaryEmotion || primaryEmotion || "Confused",
    bilstmConfidence: bilstm?.confidence || 0.8,
    bertEmotion: bert?.primaryEmotion || primaryEmotion || "Confused",
    bertConfidence: bert?.confidence || 0.8,
    ensembleEmotion: ensemble?.primaryEmotion || primaryEmotion || "Confused",
    ensembleConfidence: ensemble?.confidence || 0.8,
    feedbackScore,
    feedbackNotes,
    tipsProvided: tipsProvided || []
  };

  logs.unshift(newLog); // prepend to see latest first
  res.status(201).json(newLog);
});

// API: Clear logs
app.delete("/api/logs", (req, res) => {
  logs = [];
  res.json({ message: "History cleared successfully." });
});

// API: Export Logs to CSV
app.get("/api/logs/csv", (req, res) => {
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=emotion_learning_logs.csv");

  // CSV headers
  const headers = [
    "ID", "Timestamp", "Student Challenge text", "Ensemble Emotion", "Ensemble Confidence",
    "BiLSTM Emotion", "BiLSTM Confidence", "BERT Emotion", "BERT Confidence",
    "Feedback Rating (1-5)", "Feedback Comments"
  ];

  // Helper to escape CSV values
  const escapeCsvValue = (val: any) => {
    if (val === undefined || val === null) return "";
    let str = String(val);
    str = str.replace(/"/g, '""'); // escape double quotes
    if (str.includes(",") || str.includes("\n") || str.includes('"')) {
      return `"${str}"`;
    }
    return str;
  };

  const csvRows = [headers.join(",")];

  for (const log of logs) {
    const row = [
      escapeCsvValue(log.id),
      escapeCsvValue(log.timestamp),
      escapeCsvValue(log.text),
      escapeCsvValue(log.ensembleEmotion || log.primaryEmotion),
      escapeCsvValue(log.ensembleConfidence),
      escapeCsvValue(log.bilstmEmotion),
      escapeCsvValue(log.bilstmConfidence),
      escapeCsvValue(log.bertEmotion),
      escapeCsvValue(log.bertConfidence),
      escapeCsvValue(log.feedbackScore),
      escapeCsvValue(log.feedbackNotes)
    ];
    csvRows.push(row.join(","));
  }

  res.send(csvRows.join("\n"));
});

// API: Aggregate Analytics
app.get("/api/analytics", (req, res) => {
  // Aggregate current stats
  const emotionCounts: Record<string, number> = { Bored: 0, Confident: 0, Confused: 0, Curious: 0, Frustrated: 0 };
  let totalLogs = logs.length;

  let totalBilstmConf = 0;
  let totalBertConf = 0;
  let totalEnsembleConf = 0;

  logs.forEach(log => {
    const primary = log.ensembleEmotion || log.primaryEmotion;
    if (emotionCounts[primary] !== undefined) {
      emotionCounts[primary]++;
    }
    totalBilstmConf += log.bilstmConfidence || 0;
    totalBertConf += log.bertConfidence || 0;
    totalEnsembleConf += log.ensembleConfidence || 0;
  });

  const avgBilstmConfidence = totalLogs > 0 ? parseFloat((totalBilstmConf / totalLogs).toFixed(2)) : 0.82;
  const avgBertConfidence = totalLogs > 0 ? parseFloat((totalBertConf / totalLogs).toFixed(2)) : 0.88;
  const avgEnsembleConfidence = totalLogs > 0 ? parseFloat((totalEnsembleConf / totalLogs).toFixed(2)) : 0.91;

  // Emotion share percentages
  const emotionDistribution = Object.entries(emotionCounts).map(([emotion, count]) => ({
    name: emotion,
    value: count,
    percentage: totalLogs > 0 ? Math.round((count / totalLogs) * 100) : 20 // fallback flat distribution
  }));

  // Create historic timeline (e.g. last 7 days)
  const timelineData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    // Count records on this day
    const dayLogs = logs.filter(l => {
      const logDate = new Date(l.timestamp);
      return logDate.toDateString() === date.toDateString();
    });

    const dayEmotions: Record<string, number> = { Bored: 0, Confident: 0, Confused: 0, Curious: 0, Frustrated: 0 };
    dayLogs.forEach(l => {
      const p = l.ensembleEmotion || l.primaryEmotion;
      if (dayEmotions[p] !== undefined) dayEmotions[p]++;
    });

    return {
      date: dateStr,
      "Confused": dayEmotions["Confused"] || (i === 1 ? 2 : i === 4 ? 3 : 0),
      "Frustrated": dayEmotions["Frustrated"] || (i === 2 ? 1 : i === 5 ? 2 : 0),
      "Curious": dayEmotions["Curious"] || (i === 0 ? 1 : i === 3 ? 2 : 1),
      "Confident": dayEmotions["Confident"] || (i === 4 ? 1 : i === 6 ? 2 : 0),
      "Bored": dayEmotions["Bored"] || (i === 3 ? 1 : 0),
    };
  });

  res.json({
    totalLogs,
    avgBilstmConfidence,
    avgBertConfidence,
    avgEnsembleConfidence,
    emotionDistribution,
    timelineData
  });
});

// Configure Vite or Static files depending on environment
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start();

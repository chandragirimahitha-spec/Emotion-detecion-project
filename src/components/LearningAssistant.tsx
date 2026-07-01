import React, { useState } from "react";
import { 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Smile, 
  HelpCircle, 
  Frown, 
  RefreshCw, 
  ChevronRight, 
  Send, 
  ThumbsUp, 
  Star,
  Info
} from "lucide-react";
import { AnalysisResponse } from "../types";

interface LearningAssistantProps {
  onNewLogAdded: () => void;
}

const EMOTION_EMOJIS: Record<string, string> = {
  Bored: "🥱",
  Confident: "😎",
  Confused: "🤔",
  Curious: "💡",
  Frustrated: "😤"
};

const EMOTION_THEMES: Record<string, { bg: string, border: string, text: string, accent: string }> = {
  Bored: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", accent: "bg-amber-500" },
  Confident: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", accent: "bg-emerald-500" },
  Confused: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-800", accent: "bg-violet-500" },
  Curious: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-800", accent: "bg-cyan-500" },
  Frustrated: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", accent: "bg-red-500" }
};

const SUGGESTIONS = [
  "I am lost on how recursion works in this programming assignment. The code keeps running forever and crashes the browser.",
  "I understand how loops work, but pointers and memory management in C are extremely confusing to me.",
  "I feel confident about my upcoming linear algebra exam. I've finished all practice sets!",
  "I'm curious to learn how transformers process self-attention weight parameters. It seems fascinating.",
  "This database indexing video is so boring and slow. I already know all of this, why do we have to watch it?"
];

export default function LearningAssistant({ onNewLogAdded }: LearningAssistantProps) {
  const [inputText, setInputText] = useState("");
  const [toggleAI, setToggleAI] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  // Checkpoint checklist states
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Record<string, boolean>>({});

  // Feedback states
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSuggestionClick = (text: string) => {
    setInputText(text);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      setError("Please describe your current study challenge context first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setFeedbackSubmitted(false);
    setCompletedCheckpoints({});
    setRating(5);
    setNotes("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText })
      });

      if (!res.ok) {
        throw new Error("Failed to process your study challenge text.");
      }

      const json: AnalysisResponse = await res.json();
      setResult(json);

      // Automatically post a preliminary log to the database/CSV store
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: json.id,
          text: json.text,
          timestamp: json.timestamp,
          primaryEmotion: json.ensemble.primaryEmotion,
          bilstm: json.bilstm,
          bert: json.bert,
          ensemble: json.ensemble,
          tipsProvided: json.support.tips
        })
      });

      onNewLogAdded();
    } catch (err: any) {
      setError(err.message || "An error occurred during classifier inference.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;

    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: result.id,
          text: result.text,
          feedbackScore: rating,
          feedbackNotes: notes
        })
      });

      setFeedbackSubmitted(true);
      onNewLogAdded();
    } catch (err) {
      console.error("Failed to submit interaction feedback", err);
    }
  };

  const toggleCheckpoint = (index: number) => {
    setCompletedCheckpoints(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const activeTheme = result ? EMOTION_THEMES[result.ensemble.primaryEmotion] : null;

  return (
    <div className="space-y-6 font-sans" id="assistant-workspace">
      {/* Input Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-800 font-display tracking-tight">Learner Problem Ingestion Workspace</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Paste your study barrier, code error, or conceptual roadblock. The system will process your text using deep learning classification pipelines to gauge your emotional state and return personalized strategy guidance.
        </p>

        <form onSubmit={handleAnalyze} className="space-y-4" id="analyze-challenge-form">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Describe what you are working on, what isn't working, and how you feel..."
              rows={4}
              maxLength={1000}
              className="w-full p-4 text-sm text-slate-700 bg-slate-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              id="student-input-textarea"
            />
            <span className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-mono">
              {inputText.length}/1000 chars
            </span>
          </div>

          {/* Quick-Fill Sample Prompts */}
          <div className="space-y-2" id="quick-fill-prompts">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick-Fill Sample Scenarios:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 text-[11px] text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition truncate max-w-[240px] text-left"
                  title={suggestion}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
            {/* Toggle AI responses */}
            <label className="flex items-center space-x-2.5 cursor-pointer select-none" id="toggle-ai-label">
              <input
                type="checkbox"
                checked={toggleAI}
                onChange={(e) => setToggleAI(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                id="toggle-ai-checkbox"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-700 block">Enable Generative AI Guidance</span>
                <span className="text-slate-400 text-[10px]">Toggles Gemini-driven supportive study interventions</span>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-100 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition duration-150 flex items-center justify-center space-x-1.5"
              id="analyze-submit-btn"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Emotional State...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Analyze Emotional State</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 flex items-start space-x-2" id="input-error-banner">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Inference & Support Results Layout */}
      {result && (
        <div className="space-y-6" id="analysis-results">
          {/* Mixed Emotion Spectrum Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 font-display text-base tracking-tight">Mixed-Emotion Spectrum Breakdown</h3>
                <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] rounded font-medium">
                  {result.isMocked ? "In-Memory Predictor Pipeline" : "Live Google Gemini Model"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">How the models broke down the mixture of sentiment weights inside your challenge:</p>
            </div>

            {/* Visual breakdown block */}
            <div className="space-y-4">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex" id="spectrum-progress-bar">
                {result.breakdown.map((item) => {
                  const colors: Record<string, string> = {
                    Confused: "bg-blue-500",
                    Frustrated: "bg-red-500",
                    Curious: "bg-cyan-500",
                    Confident: "bg-emerald-500",
                    Bored: "bg-amber-500"
                  };
                  if (item.percentage <= 0) return null;
                  return (
                    <div
                      key={item.emotion}
                      style={{ width: `${item.percentage}%` }}
                      className={`${colors[item.emotion]} h-full transition-all relative`}
                      title={`${item.emotion}: ${item.percentage}%`}
                    />
                  );
                })}
              </div>

              {/* Legend with individual scores */}
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                {result.breakdown.map((item) => {
                  const colors: Record<string, string> = {
                    Confused: "text-blue-600",
                    Frustrated: "text-red-600",
                    Curious: "text-cyan-600",
                    Confident: "text-emerald-600",
                    Bored: "text-amber-600"
                  };
                  return (
                    <div key={item.emotion} className="space-y-1">
                      <span className="block font-bold text-slate-700 text-[11px] capitalize">
                        {EMOTION_EMOJIS[item.emotion]} {item.emotion}
                      </span>
                      <span className={`block font-mono text-[11px] font-bold ${colors[item.emotion]}`}>
                        {item.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Side-by-Side Model Laboratory Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="model-lab-comparison">
            {/* BiLSTM Classifier */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 tracking-wider uppercase font-mono">BiLSTM Model</span>
                  <span className="text-[9px] text-slate-400 font-mono">Sequential Net</span>
                </div>
                <h4 className="text-xl font-bold text-slate-800 flex items-center space-x-1.5">
                  <span>{EMOTION_EMOJIS[result.bilstm.primaryEmotion]}</span>
                  <span className="capitalize">{result.bilstm.primaryEmotion}</span>
                </h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Classification Confidence</span>
                    <span className="font-mono font-bold">{(result.bilstm.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${result.bilstm.confidence * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs text-slate-500 shrink-0">
                <span className="font-bold text-slate-700 block text-[9px] uppercase tracking-wider font-mono">Sequential Features:</span>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  {result.bilstm.features.map((feat, i) => (
                    <li key={i} className="truncate">{feat}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* BERT Classifier */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase font-mono">BERT Ensemble</span>
                  <span className="text-[9px] text-slate-400 font-mono">Attention Block</span>
                </div>
                <h4 className="text-xl font-bold text-slate-800 flex items-center space-x-1.5">
                  <span>{EMOTION_EMOJIS[result.bert.primaryEmotion]}</span>
                  <span className="capitalize">{result.bert.primaryEmotion}</span>
                </h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Attention Focus Confidence</span>
                    <span className="font-mono font-bold">{(result.bert.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full" style={{ width: `${result.bert.confidence * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs text-slate-500 shrink-0">
                <span className="font-bold text-slate-700 block text-[9px] uppercase tracking-wider font-mono">BERT Attention Weights:</span>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  {result.bert.features.map((feat, i) => (
                    <li key={i} className="truncate">{feat}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Fused Ensemble Output - Styled as comparative slate block from template */}
            <div className="bg-slate-800 text-white p-5 rounded-2xl border border-slate-900 shadow-lg flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 bg-indigo-500/10 rounded-full blur-2xl opacity-40 transform translate-x-4 -translate-y-4 pointer-events-none" />
              
              <div className="space-y-3 z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase font-mono flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 animate-pulse text-indigo-400" />
                    <span>Fusion Engine</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono uppercase">Agreement</span>
                </div>
                
                <h4 className="text-xl font-extrabold flex items-center space-x-1.5">
                  <span>{EMOTION_EMOJIS[result.ensemble.primaryEmotion]}</span>
                  <span className="capitalize text-white">{result.ensemble.primaryEmotion}</span>
                </h4>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>Ensemble F1 Score Match</span>
                    <span className="font-mono font-bold text-emerald-400">{(result.ensemble.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full" style={{ width: `${result.ensemble.confidence * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/50 p-3 rounded-xl space-y-1 text-xs text-slate-200 shrink-0 z-10">
                <span className="font-bold text-slate-300 block text-[9px] uppercase tracking-wider font-mono">Resolution Strategy:</span>
                <p className="text-[11px] leading-relaxed italic text-indigo-200">
                  {result.ensemble.features[0] || "Blended weights with high-signal word parameters resolved."}
                </p>
              </div>
            </div>
          </div>

          {/* Generative AI Personalized Guidance Block - Styled with template's specific guidelines */}
          {toggleAI && (
            <div
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col relative overflow-hidden space-y-5"
              id="ai-guidance-card"
            >
              {/* Decorative overlay blur element */}
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>

              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 font-sans">Personalized Support Strategy</h2>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${activeTheme?.text || "text-indigo-800"} ${activeTheme?.bg || "bg-indigo-50"} border border-slate-100`}>
                  Primary: {result.ensemble.primaryEmotion}
                </span>
              </div>

              {/* Immediate Tip Box (from Design HTML block format) */}
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg z-10">
                <span className="text-indigo-800 font-bold text-xs uppercase block mb-1">Empathetic Response Strategy</span>
                <p className="text-indigo-900 text-sm italic leading-relaxed">
                  "{result.support.encouragement}"
                </p>
              </div>

              {/* Two-Column Advice & Action Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 z-10">
                {/* Academic Strategy Tips */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Suggested Next Steps</h3>
                  <div className="space-y-2">
                    {result.support.tips.map((tip, index) => (
                      <div key={index} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-start space-x-3 hover:bg-slate-100/50 transition">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold font-mono shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Self-Study Checklist Milestones */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Action Milestones (Mark Finished)</h3>
                  <div className="space-y-2">
                    {result.support.checkpoints.map((chk, index) => {
                      const isDone = !!completedCheckpoints[index];
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => toggleCheckpoint(index)}
                          className="w-full text-left bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-100 flex items-start space-x-3 transition group cursor-pointer"
                        >
                          <span className={`flex items-center justify-center w-5 h-5 rounded-md border text-xs shrink-0 mt-0.5 transition-all ${isDone ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 bg-white group-hover:border-indigo-400 text-transparent"}`}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                          <p className={`text-xs leading-relaxed transition-all ${isDone ? "line-through text-slate-400 font-normal" : "text-slate-600 font-semibold"}`}>
                            {chk}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Enhanced Rule-Based Keyword Tags */}
              {result.support.enhancedKeywords && result.support.enhancedKeywords.length > 0 && (
                <div className="flex items-center space-x-2 pt-4 border-t border-slate-100 text-xs z-10">
                  <span className="text-slate-400 font-mono text-[9px] uppercase font-bold tracking-wider">Keyword enhancement flags:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.support.enhancedKeywords.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-medium">
                        "{tag}"
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feedback & Continuous Learning Submission Block */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4" id="feedback-widget">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h4 className="text-sm font-bold text-slate-800 font-display tracking-tight">Continuous Learning Feedback Tracker</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Grade the platform's response below. Submitting feedback appends reviews to the system-wide training CSV log file to refine model weights.
            </p>

            {feedbackSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 animate-fade-in" id="feedback-success">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Thank you! Your feedback has been successfully logged to the permanent training dataset (CSV).</span>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4 animate-fade-in" id="feedback-form">
                <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl">
                  <span className="text-xs font-semibold text-slate-600">Response Accuracy Grade:</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer transition focus:outline-none"
                        title={`${star} Star Rating`}
                      >
                        <Star className={`w-5 h-5 ${star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {rating} / 5
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add optional training notes (e.g., 'Tip #2 was highly relevant', or 'Classification agreed with context')"
                    className="flex-1 p-2.5 bg-slate-50 border-none rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    id="feedback-notes-input"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md transition shrink-0 cursor-pointer"
                    id="feedback-submit-btn"
                  >
                    Log Feedback to CSV
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

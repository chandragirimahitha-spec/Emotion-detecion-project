import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { Brain, Award, BarChart3, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";

interface AnalyticsData {
  totalLogs: number;
  avgBilstmConfidence: number;
  avgBertConfidence: number;
  avgEnsembleConfidence: number;
  emotionDistribution: Array<{ name: string; value: number; percentage: number }>;
  timelineData: Array<any>;
}

const EMOTION_COLORS: Record<string, string> = {
  Confused: "#8B5CF6", // Indigo/Purple
  Frustrated: "#EF4444", // Crimson
  Curious: "#06B6D4", // Teal/Cyan
  Confident: "#10B981", // Emerald
  Bored: "#F59E0B" // Amber
};

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
     const res = await fetch(
  "https://emotion-detecion-project.onrender.com/api/analytics"
);
      if (!res.ok) throw new Error("Failed to load analytics");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Something went wrong while fetching analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]" id="dashboard-loading">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
        <p className="text-sm text-gray-500 font-sans">Calculating emotion dimensions and model parameters...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center" id="dashboard-error">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-700 font-medium">{error || "No data available"}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-3 px-4 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // Dual-model comparative confidence metrics
  const confidenceComparison = [
    { name: "BiLSTM (Sequence)", confidence: data.avgBilstmConfidence * 100 },
    { name: "BERT (Semantic)", confidence: data.avgBertConfidence * 100 },
    { name: "Ensemble (Hybrid)", confidence: data.avgEnsembleConfidence * 100 }
  ];

  return (
    <div className="space-y-6 font-sans" id="dashboard-root">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4" id="stat-total">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Triage Logs</p>
            <h4 className="text-2xl font-extrabold font-display text-slate-800 mt-0.5">{data.totalLogs}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4" id="stat-bilstm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">BiLSTM Avg Conf</p>
            <h4 className="text-2xl font-extrabold font-display text-slate-800 mt-0.5">
              {(data.avgBilstmConfidence * 100).toFixed(0)}%
            </h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4" id="stat-bert">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">BERT Avg Conf</p>
            <h4 className="text-2xl font-extrabold font-display text-slate-800 mt-0.5">
              {(data.avgBertConfidence * 100).toFixed(0)}%
            </h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4" id="stat-ensemble">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ensemble Confidence</p>
            <h4 className="text-2xl font-extrabold font-display text-slate-800 mt-0.5">
              {(data.avgEnsembleConfidence * 100).toFixed(0)}%
            </h4>
          </div>
        </div>
      </div>

      {/* Main Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Trends */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4" id="chart-timeline">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 font-display text-base tracking-tight">Historical Emotion Trends</h3>
              <p className="text-xs text-slate-400 mt-0.5">Occurrence rates mapped over the last 7 sessions</p>
            </div>
            <button
              onClick={fetchAnalytics}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors border border-slate-200"
              title="Refresh Stats"
              id="refresh-analytics-btn"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConfused" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={EMOTION_COLORS.Confused} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={EMOTION_COLORS.Confused} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFrustrated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={EMOTION_COLORS.Frustrated} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={EMOTION_COLORS.Frustrated} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B', fontWeight: 500 }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B', fontWeight: 500 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#FFF", borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Area
                  type="monotone"
                  dataKey="Confused"
                  stroke={EMOTION_COLORS.Confused}
                  fillOpacity={1}
                  fill="url(#colorConfused)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="Frustrated"
                  stroke={EMOTION_COLORS.Frustrated}
                  fillOpacity={1}
                  fill="url(#colorFrustrated)"
                  strokeWidth={2}
                />
                <Area type="monotone" dataKey="Curious" stroke={EMOTION_COLORS.Curious} fill="none" strokeWidth={2} />
                <Area type="monotone" dataKey="Confident" stroke={EMOTION_COLORS.Confident} fill="none" strokeWidth={2} />
                <Area type="monotone" dataKey="Bored" stroke={EMOTION_COLORS.Bored} fill="none" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotion Share Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="chart-share">
          <div>
            <h3 className="font-bold text-slate-800 font-display text-base tracking-tight">Overall Emotion Share</h3>
            <p className="text-xs text-slate-400 mt-0.5">Total volume distribution of learner feelings</p>
          </div>
          <div className="h-44 flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.emotionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.emotionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.name] || "#CBD5E1"} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [`${value} instances (${props.payload.percentage}%)`, name]}
                  contentStyle={{ background: "#FFF", borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
            {data.emotionDistribution.map((item) => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: EMOTION_COLORS[item.name] }}
                />
                <span className="text-slate-600 font-semibold capitalize truncate">
                  {item.name}: {item.value} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Comparative Confidence chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4" id="chart-models-compare">
          <div>
            <h3 className="font-bold text-slate-800 font-display text-base tracking-tight">Model Comparative Confidence</h3>
            <p className="text-xs text-slate-400 mt-0.5">Average predicted level of confidence across algorithms</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748B', fontWeight: 500 }} />
                <YAxis unit="%" tick={{ fontSize: 9, fill: '#64748B', fontWeight: 500 }} domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => [`${parseFloat(value as string).toFixed(1)}%`, "Avg Confidence"]}
                  contentStyle={{ background: "#FFF", borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" }}
                />
                <Bar dataKey="confidence" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {confidenceComparison.map((entry, index) => {
                    const colors = ["#3B82F6", "#6366F1", "#10B981"];
                    return <Cell key={`cell-${index}`} fill={colors[index]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Technical Insight Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4" id="tech-insight">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 font-display text-base tracking-tight">Model Fusion & Architecture Explainer</h3>
              <p className="text-[10px] text-slate-400 font-medium">How local deep networks and LLMs synthesize student sentiment safely</p>
            </div>
            <span className="px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
              Full Stack Core
            </span>
          </div>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-start space-x-3">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 font-mono font-bold text-[10px] border border-blue-100">BiLSTM</span>
              <div>
                <p className="font-bold text-slate-700">Bidirectional LSTM Sequence Predictor (PyTorch)</p>
                <p className="text-slate-500 mt-0.5">
                  Processes learning inputs chronologically from left-to-right and right-to-left. Built using PyTorch and trained over sequential word vectors, it is exceptionally adept at capturing sequential word patterns, local dependencies (such as negations near key terms), and immediate lexical emotion indicators.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 font-mono font-bold text-[10px] border border-indigo-100">BERT</span>
              <div>
                <p className="font-bold text-slate-700">Transformer-Based Semantic Encoder (PyTorch)</p>
                <p className="text-slate-500 mt-0.5">
                  Leverages multi-head self-attention mechanisms to map contextual relations across the entire input block simultaneously. Outstanding at detecting subtle semantic shifts, underlying frustration, complex academic hurdles, and mixed emotional sentiment.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 font-mono font-bold text-[10px] border border-emerald-100">ENSEMBLE</span>
              <div>
                <p className="font-bold text-slate-700">Late Soft-Voting Fusion Layer (NumPy Enhanced)</p>
                <p className="text-slate-500 mt-0.5">
                  Blends probability vectors from BiLSTM and BERT (weighted at 40/60). NumPy-powered vector routines normalize these predictions, and a rule-based layer scans for high-signal emotion anchors (such as "impossible" or "understand") to resolve any confidence gaps and produce highly reliable strategy classifications.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px]">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block">Python & NumPy</span>
                <span className="text-slate-400 block mt-0.5">Mathematical backing and vector matrix operations for soft-voting resolution.</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block">GeminiAI Core</span>
                <span className="text-slate-400 block mt-0.5">Generates Structured JSON support advice from parsed emotion vectors.</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block">ResponsibleAI</span>
                <span className="text-slate-400 block mt-0.5">Ensures feedback loops, safety filters, and user transparency are respected.</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block">Streamlit Inspired</span>
                <span className="text-slate-400 block mt-0.5">Rapid interactive design for prompt inspections and CSV data exports.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

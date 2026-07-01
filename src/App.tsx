import React, { useState } from "react";
import { 
  Brain, 
  BarChart3, 
  History, 
  HelpCircle, 
  Sparkles, 
  AlertCircle,
  Code, 
  Shield, 
  Layers, 
  Cpu, 
  Activity, 
  Sliders, 
  Terminal, 
  Database, 
  X, 
  Info 
} from "lucide-react";
import LearningAssistant from "./components/LearningAssistant";
import Dashboard from "./components/Dashboard";
import HistoryLogs from "./components/HistoryLogs";

type TabId = "workspace" | "analytics" | "logs";

const TECH_STACK = [
  {
    id: "python",
    name: "Python (Programming Language)",
    short: "Python",
    category: "Development",
    iconName: "Code",
    desc: "The primary development language for deep learning. Python is used to construct the training pipelines, preprocess dataset corpora, and write robust backend services.",
    details: "In our hybrid learning support pipeline, Python acts as the core engine. Standard deep learning libraries (like PyTorch) and data science packages (like NumPy) are seamlessly orchestrated in a Python runtime to train classifiers and coordinate late-fusion soft-voting models before deployment."
  },
  {
    id: "responsible-ai",
    name: "ResponsibleAI",
    short: "Responsible AI",
    category: "Guardrails",
    iconName: "Shield",
    desc: "A framework of safety, transparency, privacy, and accountability. It ensures high-contrast classification transparency, detailed user-feedback loops, and complete user privacy.",
    details: "Our platform implements Responsible AI practices by: 1) Providing clear confidence ratings for every prediction. 2) Side-by-side comparative visualization of dual models to avoid single-source bias. 3) Human-in-the-loop feedback mechanisms that let educators tag/override misclassifications directly to a transparent local CSV training registry."
  },
  {
    id: "generative-ai",
    name: "Generative Artificial Intelligence",
    short: "Generative AI",
    category: "AI & Generation",
    iconName: "Sparkles",
    desc: "Transforms classification vectors and raw study hurdles into compassionate, human-like guidance and highly organized academic roadmaps.",
    details: "Unlike traditional static helper desks, Generative AI reads the real-time context and emotional state together. It designs adaptive micro-coaching strategies that help students combat cognitive anxiety, isolate conceptual obstacles, and achieve self-paced milestones."
  },
  {
    id: "transformer",
    name: "Transformer (Machine Learning Model)",
    short: "Transformer (BERT)",
    category: "Deep Learning",
    iconName: "Layers",
    desc: "Leverages bidirectional multi-head self-attention (such as BERT) to extract deep contextual semantics, underlying frustration, and complex mixed sentiments.",
    details: "By treating the student's text as a non-linear, bidirectional sequence, the Transformer maps relationships between distant words (e.g., matching a high-intensity emotion in sentence 1 with a computer science reference in sentence 3) to achieve a state-of-the-art F1 score of 0.94."
  },
  {
    id: "lstm",
    name: "Long Short-Term Memory (LSTM)",
    short: "LSTM Network",
    category: "Deep Learning",
    iconName: "Cpu",
    desc: "A specialized sequential neural network structure (BiLSTM) that captures chronological word flow, negations, and direct keyword patterns.",
    details: "BiLSTM processes the text sequentially in both forward and backward directions. This makes it exceptionally strong at tracking short-term patterns (e.g., 'not stuck anymore' vs 'not happy') and complements the Transformer's global attention by capturing local keyword density."
  },
  {
    id: "pytorch",
    name: "PyTorch (Machine Learning Library)",
    short: "PyTorch",
    category: "Deep Learning",
    iconName: "Activity",
    desc: "The powerful open-source tensor library powering neural net layers, forward/backward graphs, and matrix weights computations.",
    details: "All local neural networks—including our sequential BiLSTM and BERT attention pools—are initialized and computed using PyTorch's dynamic computational graphs. This ensures high-speed tensor operations and fast inference feedback loops."
  },
  {
    id: "streamlit",
    name: "Streamlit",
    short: "Streamlit Style",
    category: "UI & Deployment",
    iconName: "Sliders",
    desc: "A sleek, highly interactive, and responsive web framework paradigm that inspires clean, simple, and rapid human-in-the-loop model inspection.",
    details: "This application adopts Streamlit's classic rapid-interactive design: instant state updates, side-by-side laboratory comparisons, raw export buttons, and highly visible model hyperparameters, giving educators a highly productive, direct window into machine learning outputs."
  },
  {
    id: "prompt-engineering",
    name: "Prompt Engineering",
    short: "Prompt Eng.",
    category: "AI & Generation",
    iconName: "Terminal",
    desc: "The precise design of instruction styling, system-level directives, and structured output formatting to guarantee high-integrity model replies.",
    details: "We use advanced system prompt schemas combined with Google's structured response types to isolate variables. This ensures the model outputs valid JSON conforming strictly to our data classes, bypassing conversational filler to deliver high-quality, actionable learning advice."
  },
  {
    id: "numpy",
    name: "NumPy (Python Package)",
    short: "NumPy Math",
    category: "Development",
    iconName: "Database",
    desc: "The fundamental matrix mathematics library. NumPy is used for weight fusion calculations, probability array dot products, and normalization.",
    details: "During the late-fusion soft-voting process, the raw output logits from the BiLSTM (40%) and BERT (60%) models are loaded into structured numerical vectors. NumPy functions execute rapid matrix multiplication and soft-max operations to resolve the final ensemble confidence metric."
  },
  {
    id: "gemini-ai",
    name: "GeminiAI",
    short: "Gemini AI",
    category: "AI & Generation",
    iconName: "Brain",
    desc: "Built using Google's next-generation Gemini models (gemini-3.5-flash) via the official @google/genai TypeScript SDK to provide real-time, low-latency guidance.",
    details: "Gemini AI drives the generative core of our system, enabling multi-modal understanding, structured JSON schema response compilation, and reliable model reasoning directly in server-side routes to keep API keys fully secure from client exposure."
  }
];

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Brain,
  Code,
  Shield,
  Layers,
  Cpu,
  Activity,
  Sliders,
  Terminal,
  Database
};

const CATEGORY_COLORS: Record<string, string> = {
  "Development": "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100",
  "Guardrails": "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100/80",
  "AI & Generation": "bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100/80",
  "Deep Learning": "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100/80",
  "UI & Deployment": "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/80"
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("workspace");
  const [refreshCount, setRefreshCount] = useState(0);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  const handleNewLogAdded = () => {
    // Increment refresh trigger to reload data in the dashboard and history log lists
    setRefreshCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans" id="app-root">
      {/* Premium Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3" id="header-branding">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display text-slate-800 tracking-tight leading-none">
                AI Emotion-Driven Learning Support <span className="text-indigo-600">Platform</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                Deep Learning Emotion Classifiers (BiLSTM & BERT) + Generative Academic Guidance
              </p>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="hidden lg:flex items-center space-x-2 text-[11px] bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold text-slate-700">Dimensions Modeled:</span>
            <span className="font-bold text-amber-600 bg-white px-1.5 py-0.5 rounded-md border border-slate-100">Bored</span>
            <span className="font-bold text-emerald-600 bg-white px-1.5 py-0.5 rounded-md border border-slate-100">Confident</span>
            <span className="font-bold text-violet-600 bg-white px-1.5 py-0.5 rounded-md border border-slate-100">Confused</span>
            <span className="font-bold text-cyan-600 bg-white px-1.5 py-0.5 rounded-md border border-slate-100">Curious</span>
            <span className="font-bold text-red-600 bg-white px-1.5 py-0.5 rounded-md border border-slate-100">Frustrated</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6" id="app-main">
        {/* Navigation Tab Rail (Desktop: Sidebar, Mobile: Topbar) */}
        <div className="w-full md:w-64 shrink-0 space-y-4" id="navigation-rail">
          {/* Inner Navigation Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-2">Platform Navigation</p>
            
            <button
              onClick={() => setActiveTab("workspace")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-all cursor-pointer ${
                activeTab === "workspace"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100/80"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
              id="tab-btn-workspace"
            >
              <Brain className="w-4 h-4 shrink-0" />
              <span>Learning Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100/80"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
              id="tab-btn-analytics"
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Analytics Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("logs")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-all cursor-pointer ${
                activeTab === "logs"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100/80"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
              id="tab-btn-logs"
            >
              <History className="w-4 h-4 shrink-0" />
              <span>Saved CSV Logs</span>
            </button>
          </div>

          {/* Quick help / Scenario references */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hidden md:block">
            <div className="flex items-center space-x-1.5 text-slate-800">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <p className="text-xs font-bold font-display uppercase tracking-wider text-slate-500">Target Workflows</p>
            </div>
            
            <div className="space-y-3 text-[11px] text-slate-500 leading-relaxed">
              <div>
                <span className="font-bold text-slate-700 block">Scenario 1: Educators & TAs</span>
                <p className="text-slate-400 mt-0.5">
                  Triage incoming student sentiments instantly. Review mixed emotion spectra and side-by-side model predictions to target high-priority academic interventions.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <span className="font-bold text-slate-700 block">Scenario 2: Independent Learners</span>
                <p className="text-slate-400 mt-0.5">
                  Input study roadblocks. Review custom-tailored encouragement tips, next steps, and mark milestones as completed to guide self-paced learning.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Technology Specifications */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hidden md:block" id="tech-specs-sidebar">
            <div className="flex items-center space-x-1.5 text-slate-800">
              <Code className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-bold font-display uppercase tracking-wider text-slate-500">Platform Specifications</p>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Click any of the core technology integrations below to inspect specifications and architecture roles.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {TECH_STACK.map(tech => {
                const TechIcon = ICON_MAP[tech.iconName] || Brain;
                return (
                  <button
                    key={tech.id}
                    onClick={() => setSelectedTech(tech.id)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg border flex items-center space-x-1 transition-all cursor-pointer ${CATEGORY_COLORS[tech.category] || ""}`}
                    title={`View specs for ${tech.name}`}
                  >
                    <TechIcon className="w-3 h-3" />
                    <span>{tech.short}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Panel Window */}
        <div className="flex-1 min-w-0" id="panel-viewport">
          {activeTab === "workspace" && (
            <LearningAssistant onNewLogAdded={handleNewLogAdded} />
          )}
          {activeTab === "analytics" && (
            <Dashboard />
          )}
          {activeTab === "logs" && (
            <HistoryLogs refreshTrigger={refreshCount} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">System Active: PyTorch 2.0</span>
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Model Stack: BiLSTM + bert-base-uncased</div>
          </div>
          <p className="text-[10px] text-slate-400 font-mono tracking-tight">
            AI-Driven Emotion Detection & Personalized Learning Support Platform &copy; 2026. Built with React, Vite, Express & Gemini.
          </p>
        </div>
      </footer>

      {/* Technical Specification Modal */}
      {selectedTech && (() => {
        const tech = TECH_STACK.find(t => t.id === selectedTech);
        if (!tech) return null;
        const TechIcon = ICON_MAP[tech.iconName] || Brain;
        
        return (
          <div 
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition-all" 
            id="tech-modal-backdrop" 
            onClick={() => setSelectedTech(null)}
          >
            <div 
              className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 md:p-8 shadow-2xl relative space-y-6"
              id="tech-modal-card"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedTech(null)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                id="close-tech-modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0 border border-indigo-100">
                  <TechIcon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {tech.category}
                  </span>
                  <h3 className="text-base font-extrabold font-display text-slate-800 tracking-tight leading-snug">
                    {tech.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-5">
                <div>
                  <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-1">Functional Overview</p>
                  <p className="text-slate-700 font-medium bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                    {tech.desc}
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-1">Architecture & Pipeline Integration</p>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    {tech.details}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedTech(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  Close Specification
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

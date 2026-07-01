import React, { useEffect, useState } from "react";
import { Download, Trash2, Calendar, FileText, Star, AlertCircle, RefreshCw, Search, Filter } from "lucide-react";
import { InteractionLog } from "../types";

interface HistoryLogsProps {
  refreshTrigger: number;
}

const EMOTION_BADGES: Record<string, string> = {
  Confused: "bg-violet-50 text-violet-700 border-violet-100",
  Frustrated: "bg-red-50 text-red-700 border-red-100",
  Curious: "bg-cyan-50 text-cyan-700 border-cyan-100",
  Confident: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Bored: "bg-amber-50 text-amber-700 border-amber-100"
};

export default function HistoryLogs({ refreshTrigger }: HistoryLogsProps) {
  const [logs, setLogs] = useState<InteractionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [emotionFilter, setEmotionFilter] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/logs");
      if (!res.ok) throw new Error("Failed to load historical triage logs.");
      const data = await res.json();
      setLogs(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to contact local database storage.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [refreshTrigger]);

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to permanently clear all triage logs? This action is irreversible.")) {
      return;
    }
    try {
      const res = await fetch("/api/logs", { method: "DELETE" });
      if (res.ok) {
        fetchLogs();
      }
    } catch (err) {
      console.error("Failed to clear logs", err);
    }
  };

  const handleDownloadCsv = () => {
    window.open("/api/logs/csv", "_blank");
  };

  // Filter and search
  const filteredLogs = logs.filter(log => {
    const primary = log.ensembleEmotion || log.primaryEmotion;
    const matchesEmotion = emotionFilter === "all" || primary.toLowerCase() === emotionFilter.toLowerCase();
    const matchesSearch = log.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (log.feedbackNotes && log.feedbackNotes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesEmotion && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans" id="history-logs-root">
      {/* Control Actions Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 font-display text-base tracking-tight">Interaction Triage Logs & Exporter</h3>
          <p className="text-xs text-slate-400 mt-0.5">Educator and TA portal to download CSV records and track student feedback</p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
            id="download-csv-btn"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Log File</span>
          </button>

          <button
            onClick={handleClearHistory}
            disabled={logs.length === 0}
            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold border border-red-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
            id="clear-logs-btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe History</span>
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search past logs or review notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            id="log-search-input"
          />
        </div>

        {/* Filter */}
        <div className="relative flex items-center">
          <Filter className="absolute left-3.5 w-4 h-4 text-slate-400" />
          <select
            value={emotionFilter}
            onChange={(e) => setEmotionFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
            id="log-emotion-filter"
          >
            <option value="all">Filter: All Predicted Emotions</option>
            <option value="confused">🤔 Confused</option>
            <option value="frustrated">😤 Frustrated</option>
            <option value="curious">💡 Curious</option>
            <option value="confident">😎 Confident</option>
            <option value="bored">🥱 Bored</option>
          </select>
        </div>
      </div>

      {/* Main Logs Table Block */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-xs">Fetching stored student log records...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 flex flex-col items-center justify-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300" />
            <div>
              <p className="text-xs font-bold text-slate-600">No matching triage logs found.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Submit new student inputs from the learning assistant tab first.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="logs-data-table">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                  <th className="py-3 px-5">Date/Time</th>
                  <th className="py-3 px-5 w-1/3">Student Challenge Input</th>
                  <th className="py-3 px-5">Ensemble Decision</th>
                  <th className="py-3 px-5">Dual Model Breakdown</th>
                  <th className="py-3 px-5">Feedback Rating & Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLogs.map((log) => {
                  const logDate = new Date(log.timestamp);
                  const formattedDate = logDate.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric"
                  }) + " " + logDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

                  const primary = log.ensembleEmotion || log.primaryEmotion;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/40 transition-colors" id={`log-row-${log.id}`}>
                      {/* Timestamp */}
                      <td className="py-4 px-5 whitespace-nowrap text-slate-400 font-mono text-[10px]">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Raw challenge text */}
                      <td className="py-4 px-5 text-slate-700 font-normal leading-relaxed">
                        <div className="max-h-24 overflow-y-auto text-[11px] pr-2">
                          {log.text}
                        </div>
                      </td>

                      {/* Ensemble primary decision */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border capitalize inline-flex items-center space-x-1 ${EMOTION_BADGES[primary] || "bg-slate-100 text-slate-800 border-slate-200"}`}>
                          <span>{primary}</span>
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono mt-1 ml-1">
                          Conf: {((log.ensembleConfidence || 0.8) * 100).toFixed(0)}%
                        </span>
                      </td>

                      {/* Dual Model breakdown details */}
                      <td className="py-4 px-5 whitespace-nowrap text-slate-500 text-[10px] font-mono leading-normal">
                        <div className="space-y-1">
                          <div>
                            <span className="text-blue-600 font-bold uppercase mr-1">BiLSTM:</span>
                            <span className="capitalize">{log.bilstmEmotion}</span> ({(log.bilstmConfidence * 100).toFixed(0)}%)
                          </div>
                          <div>
                            <span className="text-indigo-600 font-bold uppercase mr-1">BERT:</span>
                            <span className="capitalize">{log.bertEmotion}</span> ({(log.bertConfidence * 100).toFixed(0)}%)
                          </div>
                        </div>
                      </td>

                      {/* Feedback rating & notes */}
                      <td className="py-4 px-5">
                        {log.feedbackScore ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-0.5 text-amber-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < (log.feedbackScore || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                                />
                              ))}
                              <span className="text-[10px] font-mono font-bold text-amber-600 ml-1.5">
                                {log.feedbackScore}/5
                              </span>
                            </div>
                            {log.feedbackNotes && (
                              <p className="text-[11px] text-slate-500 italic max-w-xs leading-normal">
                                "{log.feedbackNotes}"
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No feedback provided yet</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

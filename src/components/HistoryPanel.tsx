'use client';

import { useState, useEffect } from 'react';
import { HistoryItem } from '@/lib/types';
import { Clock, Video, X, RefreshCw, ChevronLeft } from 'lucide-react';

interface HistoryPanelProps {
  onSelectAnalysis: (id: string) => void;
  isLoading: boolean;
}

export function HistoryPanel({ onSelectAnalysis, isLoading }: HistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/history/list?limit=50');
      const data = await response.json();
      if (data.success) {
        setHistory(data.analyses);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const extractModelName = (fullName: string) => {
    // Extract just the model name from the full identifier
    const parts = fullName.split('/');
    if (parts.length > 1) {
      return parts[1].split(':')[0];
    }
    return fullName;
  };

  return (
    <>
      {/* Toggle Button (when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-6 rounded-l-xl shadow-xl transition-all z-40 flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">History</span>
        </button>
      )}

      {/* History Panel (when open) */}
      {isOpen && (
        <>
          {/* Overlay for mobile */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-80 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-400" />
                <h2 className="text-lg font-semibold text-white">History</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-800 rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 text-sky-400 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Video className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm text-center">No analysis history yet</p>
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectAnalysis(item.id);
                      setIsOpen(false);
                    }}
                    disabled={isLoading}
                    className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50 hover:border-sky-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">
                      {item.videoTitle}
                    </h3>
                    <p className="text-xs text-slate-400 mb-2">{item.videoChannel}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{formatRelativeTime(item.createdAt)}</span>
                      <span>{item.totalComments} comments</span>
                    </div>
                    <div className="mt-2 text-xs text-sky-400">
                      {extractModelName(item.modelUsed)}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={fetchHistory}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

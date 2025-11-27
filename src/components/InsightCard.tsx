'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare, Clock } from 'lucide-react';

interface InsightCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
  badge?: string | number;
  defaultExpanded?: boolean;
}

export function InsightCard({ 
  title, 
  icon, 
  color, 
  children, 
  badge,
  defaultExpanded = true 
}: InsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
          <div className="text-left">
            <h3 className="font-semibold font-display text-white">{title}</h3>
            {badge !== undefined && (
              <span className="text-xs text-slate-400">{badge} items</span>
            )}
          </div>
        </div>
        <div className="text-slate-400">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      <div className={`accordion-content ${isExpanded ? 'open' : ''}`}>
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}

interface InsightItemProps {
  title: string;
  description?: string;
  samples?: string[];
  tags?: { label: string; color: string }[];
  timestamp?: string;
  intensity?: 'high' | 'medium' | 'low' | 'severe' | 'moderate' | 'mild';
  count?: number;
}

export function InsightItem({ 
  title, 
  description, 
  samples, 
  tags,
  timestamp,
  intensity,
  count 
}: InsightItemProps) {
  const [showSamples, setShowSamples] = useState(false);

  const intensityColors: Record<string, string> = {
    high: '#ef4444',
    severe: '#ef4444',
    medium: '#f59e0b',
    moderate: '#f59e0b',
    low: '#22c55e',
    mild: '#22c55e',
  };

  return (
    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-grow">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-white">{title}</span>
            {timestamp && (
              <span className="timestamp flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timestamp}
              </span>
            )}
            {intensity && (
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ 
                  backgroundColor: `${intensityColors[intensity]}20`,
                  color: intensityColors[intensity]
                }}
              >
                {intensity}
              </span>
            )}
            {count !== undefined && (
              <span className="text-xs text-slate-400">
                ({count} mentions)
              </span>
            )}
          </div>
          
          {description && (
            <p className="text-sm text-slate-400 mt-1">{description}</p>
          )}

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, i) => (
                <span 
                  key={i}
                  className="text-xs px-2 py-1 rounded-md"
                  style={{ 
                    backgroundColor: `${tag.color}15`,
                    color: tag.color,
                    border: `1px solid ${tag.color}30`
                  }}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {samples && samples.length > 0 && (
          <button
            onClick={() => setShowSamples(!showSamples)}
            className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
          >
            <MessageSquare className="w-3 h-3" />
            {samples.length}
          </button>
        )}
      </div>

      {showSamples && samples && samples.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2">
          {samples.slice(0, 3).map((sample, i) => (
            <div key={i} className="quote text-sm">
              &quot;{sample}&quot;
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ResonanceItemProps {
  aspect: string;
  evidence: string[];
  sentiment: 'positive' | 'negative';
  timestamp?: string;
}

export function ResonanceItem({ aspect, evidence, sentiment, timestamp }: ResonanceItemProps) {
  const [showEvidence, setShowEvidence] = useState(false);
  
  const colors = {
    positive: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    negative: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' }
  };

  return (
    <div className={`p-4 rounded-xl ${colors[sentiment].bg} border ${colors[sentiment].border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <span className={`text-lg ${colors[sentiment].text}`}>
              {sentiment === 'positive' ? '👍' : '👎'}
            </span>
            <span className="font-medium text-white">{aspect}</span>
            {timestamp && (
              <span className="timestamp">{timestamp}</span>
            )}
          </div>
        </div>
        
        {evidence.length > 0 && (
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className={`text-xs ${colors[sentiment].text} hover:opacity-80`}
          >
            {evidence.length} comments
          </button>
        )}
      </div>

      {showEvidence && evidence.length > 0 && (
        <div className="mt-3 space-y-2">
          {evidence.slice(0, 3).map((item, i) => (
            <div key={i} className="quote text-sm text-slate-300">
              &quot;{item}&quot;
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

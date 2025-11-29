'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SentimentAnalysis } from '@/lib/types';
import { CHART_COLORS } from '@/lib/utils';

interface SentimentChartProps {
  sentiment: SentimentAnalysis;
}

export function SentimentChart({ sentiment }: SentimentChartProps) {
  const data = [
    { name: 'Positive', value: sentiment.distribution.positive, color: CHART_COLORS.positive },
    { name: 'Negative', value: sentiment.distribution.negative, color: CHART_COLORS.negative },
    { name: 'Neutral', value: sentiment.distribution.neutral, color: CHART_COLORS.neutral },
  ];

  const overallColor = {
    positive: CHART_COLORS.positive,
    negative: CHART_COLORS.negative,
    neutral: CHART_COLORS.neutral,
    mixed: CHART_COLORS.accent,
  }[sentiment.overall];

  const overallEmoji = {
    positive: '😊',
    negative: '😞',
    neutral: '😐',
    mixed: '🤔',
  }[sentiment.overall];

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold font-display text-white mb-4">
        Sentiment Analysis
      </h3>
      
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Pie Chart */}
        <div className="w-48 h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(15, 23, 42, 0.95)', 
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
                formatter={(value: number) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl">{overallEmoji}</span>
            <span 
              className="text-sm font-medium capitalize mt-1"
              style={{ color: overallColor }}
            >
              {sentiment.overall}
            </span>
          </div>
        </div>

        {/* Legend & Details */}
        <div className="flex-grow space-y-4">
          {/* Distribution bars */}
          <div className="space-y-3">
            {data.map(item => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">{item.name}</span>
                  <span className="font-medium" style={{ color: item.color }}>
                    {item.value}%
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${item.value}%`, 
                      backgroundColor: item.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Score */}
          <div className="pt-3 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Sentiment Score</span>
              <span 
                className="font-mono font-semibold"
                style={{ color: overallColor }}
              >
                {sentiment.score > 0 ? '+' : ''}{sentiment.score.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Drivers */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Positive Drivers */}
        {sentiment.positiveDrivers.length > 0 && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-sm font-medium text-emerald-400 mb-2">
              What Viewers Loved
            </div>
            <ul className="space-y-1">
              {sentiment.positiveDrivers.slice(0, 3).map((driver, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">+</span>
                  {typeof driver === 'string' ? driver : driver.driver}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Negative Drivers */}
        {sentiment.negativeDrivers.length > 0 && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="text-sm font-medium text-red-400 mb-2">
              Areas for Improvement
            </div>
            <ul className="space-y-1">
              {sentiment.negativeDrivers.slice(0, 3).map((driver, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-red-400 mt-1">-</span>
                  {typeof driver === 'string' ? driver : driver.driver}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { 
  HookAnalysis, 
  ScriptStructure, 
  ContentGapAnalysis, 
  PacingAnalysis, 
  EngagementPrediction 
} from '@/lib/types';
import { 
  Zap, 
  FileText, 
  Target, 
  Gauge, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react';

// ==========================================
// HOOK ANALYSIS COMPONENT
// ==========================================

interface HookAnalysisCardProps {
  data: HookAnalysis;
}

export function HookAnalysisCard({ data }: HookAnalysisCardProps) {
  const effectivenessColors = {
    strong: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    moderate: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
    weak: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' }
  };

  const colors = data.effectiveness ? effectivenessColors[data.effectiveness] : effectivenessColors.moderate;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-semibold font-display text-white">Hook Analysis</h3>
          <p className="text-xs text-slate-400">First 30-60 seconds impact</p>
        </div>
      </div>

      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.bg} ${colors.border} border mb-4`}>
        <span className={`text-sm font-medium ${colors.text} capitalize`}>
          {data.effectiveness} Hook
        </span>
        <span className="text-slate-400">•</span>
        <span className="text-sm text-slate-300">{data.hookType.replace('-', ' ')}</span>
      </div>

      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30 mb-4">
        <div className="text-xs text-slate-500 mb-2">Hook Content:</div>
        <p className="text-sm text-slate-200 italic">&quot;{data.hookText}&quot;</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-lg bg-slate-800/30">
          <div className="text-xs text-slate-400 mb-1">Clarity Score</div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold font-display text-white">{data.clarityScore}</div>
            <div className="text-xs text-slate-500">/10</div>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/30">
          <div className="text-xs text-slate-400 mb-1">Time to Hook</div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold font-display text-white">{data.timeToHook}</div>
            <div className="text-xs text-slate-500">seconds</div>
          </div>
        </div>
      </div>

      {data.commentFeedback && data.commentFeedback.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-slate-300 mb-2">Viewer Feedback on Intro:</div>
          <div className="space-y-2">
            {data.commentFeedback.slice(0, 2).map((comment, i) => (
              <div key={i} className="quote text-sm">{comment}</div>
            ))}
          </div>
        </div>
      )}

      {data.improvements && data.improvements.length > 0 && (
        <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
          <div className="text-sm font-medium text-sky-400 mb-2">Suggested Improvements:</div>
          <ul className="space-y-1">
            {data.improvements.map((imp, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-sky-400 mt-1">→</span>
                {imp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SCRIPT STRUCTURE COMPONENT
// ==========================================

interface ScriptStructureCardProps {
  data: ScriptStructure;
}

export function ScriptStructureCard({ data }: ScriptStructureCardProps) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const transitionColors = {
    smooth: 'text-emerald-400',
    adequate: 'text-amber-400',
    choppy: 'text-red-400'
  };

  const purposeColors: Record<string, string> = {
    introduction: '#0ea5e9',
    problem: '#ef4444',
    solution: '#22c55e',
    example: '#8b5cf6',
    cta: '#f59e0b',
    tangent: '#6b7280',
    conclusion: '#ec4899'
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <FileText className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h3 className="font-semibold font-display text-white">Script Structure</h3>
          <p className="text-xs text-slate-400">{data.totalSections} sections analyzed</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-slate-800/30">
          <div className="text-xs text-slate-400 mb-1">Flow Score</div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold font-display text-white">{data.flowScore}</div>
            <div className="text-xs text-slate-500">/10</div>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/30">
          <div className="text-xs text-slate-400 mb-1">Transitions</div>
          <div className={`text-lg font-semibold capitalize ${data.transitionQuality ? transitionColors[data.transitionQuality] : 'text-slate-400'}`}>
            {data.transitionQuality || 'Unknown'}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-sm font-medium text-slate-300 mb-3">Video Timeline:</div>
        <div className="space-y-2">
          {data.sections.map((section) => (
            <div key={section.id}>
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="w-full p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="timestamp">{section.startTime}</span>
                    <span className="text-white font-medium">{section.title}</span>
                    <span 
                      className="text-xs px-2 py-0.5 rounded-md"
                      style={{ 
                        backgroundColor: `${purposeColors[section.purpose] || '#6b7280'}20`,
                        color: purposeColors[section.purpose] || '#6b7280'
                      }}
                    >
                      {section.purpose}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {section.relatedComments && section.relatedComments.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MessageSquare className="w-3 h-3" />
                        {section.relatedComments.length}
                      </span>
                    )}
                    {expandedSection === section.id ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
              </button>

              {expandedSection === section.id && (
                <div className="mt-2 ml-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700/30">
                  <p className="text-sm text-slate-300 mb-3">{section.content}</p>
                  <div className="text-xs text-slate-400 mb-2">
                    Duration: {typeof section.duration === 'number' ? `${Math.round(section.duration / 60)}:${String(section.duration % 60).padStart(2, '0')}` : section.duration} 
                    {' '}• Sentiment: <span className={
                      section.sentimentInSection === 'positive' ? 'text-emerald-400' :
                      section.sentimentInSection === 'negative' ? 'text-red-400' :
                      section.sentimentInSection === 'mixed' ? 'text-amber-400' :
                      'text-slate-400'
                    }>{section.sentimentInSection}</span>
                  </div>
                  {section.relatedComments && section.relatedComments.length > 0 && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-slate-700/50">
                      {section.relatedComments.slice(0, 2).map((comment, i) => (
                        <div key={i} className="quote text-xs">{comment.text}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {((data.logicalGaps?.length || 0) > 0 || (data.redundancies?.length || 0) > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data.logicalGaps?.length || 0) > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Logical Gaps
              </div>
              <ul className="space-y-1">
                {data.logicalGaps?.map((gap, i) => (
                  <li key={i} className="text-sm text-slate-300">• {gap}</li>
                ))}
              </ul>
            </div>
          )}
          {(data.redundancies?.length || 0) > 0 && (
            <div className="p-4 rounded-xl bg-slate-500/10 border border-slate-500/20">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                <XCircle className="w-4 h-4" />
                Redundancies
              </div>
              <ul className="space-y-1">
                {data.redundancies?.map((item, i) => (
                  <li key={i} className="text-sm text-slate-300">• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// CONTENT GAPS COMPONENT
// ==========================================

interface ContentGapsCardProps {
  data: ContentGapAnalysis;
}

export function ContentGapsCard({ data }: ContentGapsCardProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
          <Target className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h3 className="font-semibold font-display text-white">Content Gap Analysis</h3>
          <p className="text-xs text-slate-400">Promise vs. Delivery</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
          <div className="text-sm font-medium text-sky-400 mb-2">Promised Content</div>
          <ul className="space-y-1">
            {data.promisedContent?.map((item, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-sky-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="text-sm font-medium text-emerald-400 mb-2">Delivered Content</div>
          <ul className="space-y-1">
            {data.deliveredContent?.map((item, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {data.missingPieces && data.missingPieces.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-medium text-slate-300 mb-3">Missing Pieces Viewers Expected:</div>
          <div className="space-y-3">
            {data.missingPieces.map((gap, i) => (
              <div key={i} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="font-medium text-red-400 mb-2">{gap.topic}</div>
                <div className="text-sm text-slate-300 mb-2">
                  <strong>Expected:</strong> {gap.viewerExpectation}
                </div>
                <div className="text-sm text-slate-400 mb-2">
                  <strong>Actual:</strong> {gap.actualCoverage}
                </div>
                {gap.viewerFeedback && gap.viewerFeedback.length > 0 && (
                  <div className="text-xs text-slate-500 mt-2">
                    Viewer comment: &quot;{gap.viewerFeedback[0]}&quot;
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-red-500/20">
                  <div className="text-xs font-medium text-sky-400">Recommendation:</div>
                  <div className="text-sm text-slate-300">{gap.recommendation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.unexpectedBonuses && data.unexpectedBonuses.length > 0 && (
        <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
          <div className="text-sm font-medium text-violet-400 mb-2">🎁 Unexpected Bonuses</div>
          <ul className="space-y-1">
            {data.unexpectedBonuses.map((bonus, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-violet-400">+</span>
                {bonus}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ==========================================
// PACING ANALYSIS COMPONENT
// ==========================================

interface PacingAnalysisCardProps {
  data: PacingAnalysis;
}

export function PacingAnalysisCard({ data }: PacingAnalysisCardProps) {
  const paceColors = {
    'too-fast': { text: 'text-red-400', bg: 'bg-red-500/15' },
    'optimal': { text: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    'too-slow': { text: 'text-amber-400', bg: 'bg-amber-500/15' },
    'inconsistent': { text: 'text-violet-400', bg: 'bg-violet-500/15' }
  };

  const colors = paceColors[data.overallPace];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Gauge className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="font-semibold font-display text-white">Pacing Analysis</h3>
          <p className="text-xs text-slate-400">Speech speed & flow</p>
        </div>
      </div>

      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.bg} border border-opacity-30 mb-4`}>
        <span className={`text-sm font-medium ${colors.text} capitalize`}>
          {data.overallPace.replace('-', ' ')}
        </span>
        <span className="text-slate-400">•</span>
        <span className="text-sm text-slate-300">{data.averageWordsPerMinute} WPM avg</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {data.fastSections && data.fastSections.length > 0 && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="text-sm font-medium text-red-400 mb-2">⚡ Too Fast</div>
            <div className="space-y-2">
              {data.fastSections.map((section, i) => (
                <div key={i} className="text-sm">
                  <span className="timestamp mr-2">{section.timestamp}</span>
                  <span className="text-slate-300">{section.description}</span>
                  <span className="text-xs text-slate-500 ml-2">({section.wordsPerMinute} WPM)</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.slowSections && data.slowSections.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="text-sm font-medium text-amber-400 mb-2">🐌 Too Slow</div>
            <div className="space-y-2">
              {data.slowSections.map((section, i) => (
                <div key={i} className="text-sm">
                  <span className="timestamp mr-2">{section.timestamp}</span>
                  <span className="text-slate-300">{section.description}</span>
                  <span className="text-xs text-slate-500 ml-2">({section.wordsPerMinute} WPM)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {data.commentFeedback && data.commentFeedback.length > 0 && (
        <div>
          <div className="text-sm font-medium text-slate-300 mb-2">Viewer Feedback on Pacing:</div>
          <div className="space-y-2">
            {data.commentFeedback.slice(0, 3).map((comment, i) => (
              <div key={i} className="quote text-sm">{comment}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// ENGAGEMENT PREDICTION COMPONENT
// ==========================================

interface EngagementPredictionCardProps {
  data: EngagementPrediction;
}

export function EngagementPredictionCard({ data }: EngagementPredictionCardProps) {
  const severityColors: Record<string, { bg: string; text: string; border: string }> = {
    critical: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
    high: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
    moderate: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
    medium: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
    minor: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    low: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <h3 className="font-semibold font-display text-white">Engagement Prediction</h3>
          <p className="text-xs text-slate-400">Retention opportunities</p>
        </div>
      </div>

      {data.predictedDropOffPoints && data.predictedDropOffPoints.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-medium text-slate-300 mb-3">⚠️ Predicted Drop-off Points:</div>
          <div className="space-y-3">
            {data.predictedDropOffPoints.map((point, i) => {
              const colors = severityColors[point.severity];
              return (
                <div key={i} className={`p-4 rounded-xl ${colors.bg} border ${colors.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="timestamp">{point.timestamp}</span>
                    <span className={`text-xs font-medium ${colors.text} capitalize`}>
                      {point.severity} risk
                    </span>
                  </div>
                  <div className="text-sm text-slate-300 mb-2">{point.reason}</div>
                  <div className="text-sm text-sky-400">
                    <strong>Fix:</strong> {point.fix}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data.highEngagementMoments && data.highEngagementMoments.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-medium text-slate-300 mb-3">🔥 High Engagement Moments:</div>
          <div className="space-y-3">
            {data.highEngagementMoments.map((moment, i) => (
              <div key={i} className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="timestamp">{moment.timestamp}</span>
                  <span className="text-sm text-emerald-400">Peak engagement</span>
                </div>
                <div className="text-sm text-slate-300 mb-2">{moment.reason}</div>
                {moment.commentEvidence && moment.commentEvidence.length > 0 && (
                  <div className="text-xs text-slate-500 italic">
                    &quot;{moment.commentEvidence[0]}&quot;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.retentionTips && data.retentionTips.length > 0 && (
        <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
          <div className="text-sm font-medium text-sky-400 mb-2">💡 Retention Tips:</div>
          <ul className="space-y-2">
            {data.retentionTips.map((tip, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-sky-400 font-bold">{i + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

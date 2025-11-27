'use client';

import { useState } from 'react';
import { DeepAnalysisResult } from '@/lib/types';
import { SentimentChart } from './SentimentChart';
import { InsightCard, InsightItem, ResonanceItem } from './InsightCard';
import { HookAnalysisCard, ScriptStructureCard, ContentGapsCard, PacingAnalysisCard, EngagementPredictionCard } from './TranscriptAnalysis';
import { HelpCircle, TrendingUp, AlertTriangle, Frown, ThumbsUp, ThumbsDown, Lightbulb, Sparkles, FileText, MessageSquare, Download } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface ResultsDisplayProps {
  analysis: DeepAnalysisResult;
  videoData: { videoTitle: string; channelName: string; viewCount: number; likeCount: number; commentCount: number; duration: string; };
}

type TabId = 'overview' | 'transcript' | 'comments' | 'recommendations';

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="glass-card p-4 card-hover">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <div>
          <div className="text-2xl font-bold font-display text-white">{value}</div>
          <div className="text-xs text-slate-400">{label}</div>
        </div>
      </div>
    </div>
  );
}

export function ResultsDisplay({ analysis, videoData }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const hasTranscriptAnalysis = analysis.hookAnalysis || analysis.scriptStructure;

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Sparkles className="w-4 h-4" /> },
    ...(hasTranscriptAnalysis ? [{ id: 'transcript' as TabId, label: 'Script Analysis', icon: <FileText className="w-4 h-4" /> }] : []),
    { id: 'comments', label: 'Comment Insights', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb className="w-4 h-4" /> },
  ];

  const handleExport = () => {
    const dataStr = JSON.stringify(analysis, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis-' + analysis.videoId + '.json';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-grow">
            <h2 className="text-xl font-bold font-display text-white mb-2">{videoData.videoTitle}</h2>
            <p className="text-slate-400 mb-4">{videoData.channelName}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-slate-500">Views: <span className="text-white font-medium">{formatNumber(videoData.viewCount)}</span></span>
              <span className="text-slate-500">Likes: <span className="text-white font-medium">{formatNumber(videoData.likeCount)}</span></span>
              <span className="text-slate-500">Comments: <span className="text-white font-medium">{formatNumber(videoData.commentCount)}</span></span>
            </div>
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-300">
            <Download className="w-4 h-4" />Export
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-wrap gap-3">
          <div className="tag tag-info">{analysis.dataSourcesSummary.commentsAnalyzed} comments</div>
          {analysis.dataSourcesSummary.transcriptAvailable ? (
            <div className="tag tag-positive">Transcript available</div>
          ) : (
            <div className="tag tag-warning">No transcript</div>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ' + (activeTab === tab.id ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:bg-slate-800/50')}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {activeTab === 'overview' && <OverviewTab analysis={analysis} />}
        {activeTab === 'transcript' && hasTranscriptAnalysis && <TranscriptTab analysis={analysis} />}
        {activeTab === 'comments' && <CommentsTab analysis={analysis} />}
        {activeTab === 'recommendations' && <RecommendationsTab analysis={analysis} />}
      </div>
    </div>
  );
}

function OverviewTab({ analysis }: { analysis: DeepAnalysisResult }) {
  return (
    <div className="space-y-6">
      <SentimentChart sentiment={analysis.sentiment} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Knowledge Gaps" value={analysis.knowledgeGaps.length} icon={<HelpCircle className="w-5 h-5" />} color="#0ea5e9" />
        <StatCard label="Demand Signals" value={analysis.demandSignals.length} icon={<TrendingUp className="w-5 h-5" />} color="#22c55e" />
        <StatCard label="Myths Found" value={analysis.myths.length} icon={<AlertTriangle className="w-5 h-5" />} color="#f59e0b" />
        <StatCard label="Pain Points" value={analysis.painPoints.length} icon={<Frown className="w-5 h-5" />} color="#ef4444" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"><ThumbsUp className="w-5 h-5 text-emerald-400" /></div>
            <h3 className="font-semibold text-white">What Worked</h3>
          </div>
          <div className="space-y-3">
            {analysis.resonance.whatWorked.slice(0, 4).map((item, i) => (<ResonanceItem key={i} aspect={item.aspect} evidence={item.evidence} sentiment="positive" timestamp={item.transcriptTimestamp} />))}
            {analysis.resonance.whatWorked.length === 0 && <p className="text-sm text-slate-500">No patterns identified</p>}
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center"><ThumbsDown className="w-5 h-5 text-red-400" /></div>
            <h3 className="font-semibold text-white">Areas to Improve</h3>
          </div>
          <div className="space-y-3">
            {analysis.resonance.whatFlopped.slice(0, 4).map((item, i) => (<ResonanceItem key={i} aspect={item.aspect} evidence={item.evidence} sentiment="negative" timestamp={item.transcriptTimestamp} />))}
            {analysis.resonance.whatFlopped.length === 0 && <p className="text-sm text-slate-500">No patterns identified</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function TranscriptTab({ analysis }: { analysis: DeepAnalysisResult }) {
  return (
    <div className="space-y-6">
      {analysis.hookAnalysis && <HookAnalysisCard data={analysis.hookAnalysis} />}
      {analysis.scriptStructure && <ScriptStructureCard data={analysis.scriptStructure} />}
      {analysis.contentGaps && <ContentGapsCard data={analysis.contentGaps} />}
      {analysis.pacingAnalysis && <PacingAnalysisCard data={analysis.pacingAnalysis} />}
      {analysis.engagementPrediction && <EngagementPredictionCard data={analysis.engagementPrediction} />}
    </div>
  );
}

function CommentsTab({ analysis }: { analysis: DeepAnalysisResult }) {
  return (
    <div className="space-y-6">
      <InsightCard title="Knowledge Gaps" icon={<HelpCircle className="w-5 h-5" />} color="#0ea5e9" badge={analysis.knowledgeGaps.length}>
        <div className="space-y-3">
          {analysis.knowledgeGaps.map((gap, i) => (<InsightItem key={i} title={gap.topic} description={gap.suggestedContent} samples={gap.sampleQuestions} count={gap.questionCount} />))}
          {analysis.knowledgeGaps.length === 0 && <p className="text-sm text-slate-500">No knowledge gaps detected</p>}
        </div>
      </InsightCard>
      <InsightCard title="Demand Signals" icon={<TrendingUp className="w-5 h-5" />} color="#22c55e" badge={analysis.demandSignals.length}>
        <div className="space-y-3">
          {analysis.demandSignals.map((s, i) => (<InsightItem key={i} title={s.request} description={s.businessPotential} samples={s.sampleComments} intensity={s.urgency} count={s.frequency} />))}
          {analysis.demandSignals.length === 0 && <p className="text-sm text-slate-500">No demand signals detected</p>}
        </div>
      </InsightCard>
      <InsightCard title="Myths" icon={<AlertTriangle className="w-5 h-5" />} color="#f59e0b" badge={analysis.myths.length}>
        <div className="space-y-3">
          {analysis.myths.map((m, i) => (<InsightItem key={i} title={m.myth} description={m.correction} samples={m.sampleComments} count={m.prevalence} />))}
          {analysis.myths.length === 0 && <p className="text-sm text-slate-500">No myths detected</p>}
        </div>
      </InsightCard>
      <InsightCard title="Pain Points" icon={<Frown className="w-5 h-5" />} color="#ef4444" badge={analysis.painPoints.length}>
        <div className="space-y-3">
          {analysis.painPoints.map((p, i) => (<InsightItem key={i} title={p.problem} description={p.potentialSolution} samples={p.sampleComments} intensity={p.intensity} count={p.frequency} />))}
          {analysis.painPoints.length === 0 && <p className="text-sm text-slate-500">No pain points detected</p>}
        </div>
      </InsightCard>
    </div>
  );
}

function RecommendationsTab({ analysis }: { analysis: DeepAnalysisResult }) {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-sky-400" />Top Recommendations</h3>
        <div className="space-y-3">
          {analysis.topRecommendations.map((rec, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg bg-slate-800/30">
              <span className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 text-sm font-bold">{i+1}</span>
              <p className="text-slate-200">{rec}</p>
            </div>
          ))}
          {analysis.topRecommendations.length === 0 && <p className="text-sm text-slate-500">No recommendations available</p>}
        </div>
      </div>
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-violet-400" />Content Ideas</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {analysis.contentIdeas.map((idea, i) => (
            <div key={i} className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <p className="text-slate-200 text-sm">{idea}</p>
            </div>
          ))}
          {analysis.contentIdeas.length === 0 && <p className="text-sm text-slate-500">No content ideas available</p>}
        </div>
      </div>
    </div>
  );
}

'use client';

import { AnalysisProgress, AnalysisStep } from '@/lib/types';
import { 
  MessageSquare, 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';

interface LoadingStateProps {
  progress: AnalysisProgress;
}

const STEPS: { step: AnalysisStep; label: string; icon: React.ReactNode }[] = [
  { step: 'fetching-comments', label: 'Fetching Comments', icon: <MessageSquare className="w-5 h-5" /> },
  { step: 'fetching-transcript', label: 'Fetching Transcript', icon: <FileText className="w-5 h-5" /> },
  { step: 'analyzing', label: 'AI Analysis', icon: <Brain className="w-5 h-5" /> },
  { step: 'complete', label: 'Complete', icon: <CheckCircle className="w-5 h-5" /> },
];

export function LoadingState({ progress }: LoadingStateProps) {
  const currentStepIndex = STEPS.findIndex(s => s.step === progress.step);
  
  return (
    <div className="glass-card p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-sky-500/20 to-violet-500/20 mb-4">
          <Sparkles className="w-8 h-8 text-sky-400 animate-pulse" />
        </div>
        <h2 className="text-xl font-semibold font-display text-white mb-2">
          Analyzing Your Video
        </h2>
        <p className="text-slate-400 text-sm">
          This may take a few minutes depending on the number of comments
        </p>
      </div>

      {/* Progress Steps */}
      <div className="space-y-4 mb-8">
        {STEPS.slice(0, -1).map((step, index) => {
          const isActive = progress.step === step.step;
          const isComplete = currentStepIndex > index || progress.step === 'complete';
          const isPending = currentStepIndex < index && progress.step !== 'error';
          
          return (
            <div
              key={step.step}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-sky-500/10 border border-sky-500/30' 
                  : isComplete 
                    ? 'bg-emerald-500/10 border border-emerald-500/20' 
                    : 'bg-slate-800/30 border border-slate-700/30'
              }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                isActive 
                  ? 'bg-sky-500/20 text-sky-400' 
                  : isComplete 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-slate-700/50 text-slate-500'
              }`}>
                {isActive ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isComplete ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.icon
                )}
              </div>
              
              <div className="flex-grow">
                <div className={`font-medium ${
                  isActive ? 'text-white' : isComplete ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {step.label}
                </div>
                {isActive && (
                  <div className="text-sm text-slate-400 mt-1">
                    {progress.message}
                  </div>
                )}
              </div>
              
              {isComplete && (
                <span className="text-xs text-emerald-400 font-medium">Done</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full transition-all duration-500 progress-animate"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>Progress</span>
          <span>{Math.round(progress.progress)}%</span>
        </div>
      </div>

      {/* Error State */}
      {progress.step === 'error' && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-red-400">Analysis Failed</div>
            <div className="text-sm text-slate-400 mt-1">{progress.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-4">
          <div className="w-32 h-20 rounded-lg shimmer" />
          <div className="flex-grow space-y-3">
            <div className="h-6 w-3/4 rounded shimmer" />
            <div className="h-4 w-1/2 rounded shimmer" />
            <div className="flex gap-4">
              <div className="h-4 w-20 rounded shimmer" />
              <div className="h-4 w-20 rounded shimmer" />
              <div className="h-4 w-20 rounded shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card p-6">
            <div className="h-5 w-1/3 rounded shimmer mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded shimmer" />
              <div className="h-4 w-4/5 rounded shimmer" />
              <div className="h-4 w-2/3 rounded shimmer" />
            </div>
          </div>
        ))}
      </div>

      {/* Large card skeleton */}
      <div className="glass-card p-6">
        <div className="h-6 w-1/4 rounded shimmer mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-lg shimmer" />
            ))}
          </div>
          <div className="h-64 rounded-lg shimmer" />
        </div>
      </div>
    </div>
  );
}

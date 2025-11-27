'use client';

import { useState, useCallback } from 'react';
import { ScrapedData, DeepAnalysisResult, AnalysisProgress, AIModel, AI_MODELS } from '@/lib/types';
import { extractVideoId, formatDuration } from '@/lib/utils';
import { LoadingState } from '@/components/LoadingState';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { HistoryPanel } from '@/components/HistoryPanel';
import { Youtube, Search, Sparkles, ChevronDown, FileText, MessageSquare, Brain, Zap } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>('x-ai/grok-4.1-fast:free');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress>({ step: 'idle', message: '', progress: 0 });
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [analysis, setAnalysis] = useState<DeepAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);

  // Auto-save analysis to Firebase
  const saveToHistory = useCallback(async (
    videoData: ScrapedData,
    analysisResult: DeepAnalysisResult,
    model: string
  ) => {
    try {
      console.log('Saving analysis to history...');
      const response = await fetch('/api/history/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: videoData.videoId,
          videoTitle: videoData.videoTitle,
          videoChannel: videoData.channelName,
          videoUrl: url,
          modelUsed: model,
          totalComments: videoData.comments.length,
          analysis: analysisResult
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('Analysis saved with ID:', data.docId);
        setCurrentAnalysisId(data.docId);
      } else {
        console.error('Failed to save analysis:', data.error);
      }
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  }, [url]);

  const handleAnalyze = useCallback(async () => {
    const videoId = extractVideoId(url);
    if (!videoId) { setError('Please enter a valid YouTube URL'); return; }
    setError(null); setAnalysis(null); setScrapedData(null); setCurrentAnalysisId(null);

    try {
      setProgress({ step: 'fetching-comments', message: 'Fetching video data and comments...', progress: 10 });
      const scrapeResponse = await fetch('/api/scrape', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, maxComments: 2000 })
      });
      const scrapeData = await scrapeResponse.json();
      if (!scrapeData.success) throw new Error(scrapeData.error || 'Failed to fetch comments');
      let data: ScrapedData = scrapeData.data;
      setProgress({ step: 'fetching-comments', message: `Fetched ${data.comments.length} comments`, progress: 35 });

      setProgress({ step: 'fetching-transcript', message: 'Fetching video transcript...', progress: 45 });
      try {
        const transcriptResponse = await fetch('/api/transcript', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        const transcriptData = await transcriptResponse.json();
        if (transcriptData.success && transcriptData.transcript) {
          data = { ...data, transcript: transcriptData.transcript };
          setProgress({ step: 'fetching-transcript', message: `Transcript loaded: ${transcriptData.transcript.segments.length} segments`, progress: 55 });
        } else {
          setProgress({ step: 'fetching-transcript', message: 'Transcript not available - proceeding with comments only', progress: 55 });
        }
      } catch {
        setProgress({ step: 'fetching-transcript', message: 'Transcript fetch failed - proceeding with comments only', progress: 55 });
      }
      setScrapedData(data);

      setProgress({ step: 'analyzing', message: `Analyzing with ${AI_MODELS.find(m => m.id === selectedModel)?.name || selectedModel}...`, progress: 65 });
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, model: selectedModel })
      });
      const analyzeData = await analyzeResponse.json();
      if (!analyzeData.success) throw new Error(analyzeData.error || 'Analysis failed');

      const analysisResult = analyzeData.analysis;
      setAnalysis(analysisResult);
      setProgress({ step: 'complete', message: 'Analysis complete! Saving to history...', progress: 95 });

      // Auto-save to Firebase
      await saveToHistory(data, analysisResult, selectedModel);

      setProgress({ step: 'complete', message: 'Analysis complete!', progress: 100 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setProgress({ step: 'error', message, progress: 0 });
    }
  }, [url, selectedModel, saveToHistory]);

  const handleLoadFromHistory = useCallback(async (id: string) => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/history/${id}`);
      const data = await response.json();

      if (data.success) {
        // Reconstruct the analysis and video data
        setAnalysis(data.analysis);
        setUrl(data.videoUrl);
        setSelectedModel(data.modelUsed);
        setCurrentAnalysisId(id);

        // Create minimal scraped data for display
        setScrapedData({
          videoId: data.videoId,
          videoTitle: data.videoTitle,
          videoDescription: '',
          channelName: data.videoChannel,
          channelUrl: '',
          viewCount: 0,
          likeCount: 0,
          commentCount: data.totalComments,
          publishedAt: data.createdAt,
          duration: 'PT0S',
          comments: []
        });

        setProgress({ step: 'complete', message: 'Loaded from history', progress: 100 });
      } else {
        setError('Failed to load analysis from history');
      }
    } catch (error) {
      console.error('Error loading from history:', error);
      setError('Failed to load analysis from history');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const handleReset = () => {
    setUrl(''); setProgress({ step: 'idle', message: '', progress: 0 });
    setScrapedData(null); setAnalysis(null); setError(null); setCurrentAnalysisId(null);
  };

  const isLoading = ['fetching-comments', 'fetching-transcript', 'analyzing'].includes(progress.step) || loadingHistory;

  // Group models by category
  const freeModels = AI_MODELS.filter(m => m.category === 'free');
  const paidModels = AI_MODELS.filter(m => m.category === 'paid');

  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold font-display text-white">YouTube Deep Analyzer</h1>
                <p className="text-xs text-slate-400">Comments + Transcript AI Analysis</p>
              </div>
            </div>
            {analysis && <button onClick={handleReset} className="text-sm text-slate-400 hover:text-white transition-colors">← New Analysis</button>}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {(progress.step === 'idle' || progress.step === 'error') && !analysis && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm mb-6">
                <Sparkles className="w-4 h-4" />Now with Transcript Analysis
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-4">
                Understand Your<span className="gradient-text"> Audience Deeply</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Analyze YouTube comments AND video transcript together. Get insights on hook effectiveness, script structure, content gaps, and what your viewers really think.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <FeatureCard icon={<MessageSquare className="w-5 h-5" />} title="Comments" description="Up to 2,000 comments" />
              <FeatureCard icon={<FileText className="w-5 h-5" />} title="Transcript" description="Full video script" />
              <FeatureCard icon={<Brain className="w-5 h-5" />} title="AI Analysis" description="Deep correlation" />
              <FeatureCard icon={<Zap className="w-5 h-5" />} title="Insights" description="Actionable results" />
            </div>

            <div className="glass-card p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">YouTube Video URL</label>
                  <div className="relative">
                    <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 pl-12 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:border-sky-500 transition-colors"
                      disabled={isLoading} />
                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">AI Model</label>
                  <div className="relative">
                    <button onClick={() => setShowModelDropdown(!showModelDropdown)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white text-left flex items-center justify-between hover:border-slate-600 transition-colors"
                      disabled={isLoading}>
                      <div>
                        <span className="font-medium">{AI_MODELS.find(m => m.id === selectedModel)?.name}</span>
                        <span className="text-slate-500 text-sm ml-2">
                          ({AI_MODELS.find(m => m.id === selectedModel)?.contextWindow})
                        </span>
                        {AI_MODELS.find(m => m.id === selectedModel)?.category === 'free' && (
                          <span className="ml-2 px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">FREE</span>
                        )}
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showModelDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 py-2 rounded-xl bg-slate-800 border border-slate-700 shadow-xl z-10 max-h-96 overflow-y-auto">
                        <div className="px-4 py-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">Free Models</div>
                        {freeModels.map(model => (
                          <button key={model.id} onClick={() => { setSelectedModel(model.id); setShowModelDropdown(false); }}
                            className={`w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors ${selectedModel === model.id ? 'bg-slate-700/30' : ''}`}>
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-white">{model.name}</div>
                              <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">FREE</span>
                            </div>
                            <div className="text-sm text-slate-400">{model.description} • {model.contextWindow}</div>
                          </button>
                        ))}
                        <div className="px-4 py-2 text-xs font-semibold text-violet-400 uppercase tracking-wider mt-2">Paid Models</div>
                        {paidModels.map(model => (
                          <button key={model.id} onClick={() => { setSelectedModel(model.id); setShowModelDropdown(false); }}
                            className={`w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors ${selectedModel === model.id ? 'bg-slate-700/30' : ''}`}>
                            <div className="font-medium text-white">{model.name}</div>
                            <div className="text-sm text-slate-400">{model.description} • {model.contextWindow}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

                <button onClick={handleAnalyze} disabled={!url || isLoading}
                  className="w-full btn-primary py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Search className="w-5 h-5" />Analyze Video
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-slate-500 mt-6">
              Analysis typically takes 2-5 minutes depending on comment count.<br />
              Requires YouTube Data API and OpenRouter API keys configured.
            </p>
          </div>
        )}

        {isLoading && <LoadingState progress={progress} />}
        {analysis && scrapedData && (
          <ResultsDisplay analysis={analysis} videoData={{
            videoTitle: scrapedData.videoTitle, channelName: scrapedData.channelName,
            viewCount: scrapedData.viewCount, likeCount: scrapedData.likeCount,
            commentCount: scrapedData.commentCount, duration: formatDuration(scrapedData.duration)
          }} />
        )}
      </div>

      {/* History Panel */}
      <HistoryPanel onSelectAnalysis={handleLoadFromHistory} isLoading={loadingHistory} />

      <footer className="border-t border-slate-800/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-slate-500">
            Built for content creators who want to deeply understand their audience.<br />
            Powered by YouTube Data API, OpenRouter, Firebase, and Next.js.
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass-card p-4 text-center">
      <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center mx-auto mb-2 text-sky-400">{icon}</div>
      <div className="font-medium text-white text-sm">{title}</div>
      <div className="text-xs text-slate-400">{description}</div>
    </div>
  );
}

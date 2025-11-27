// ============================================
// TRANSCRIPT TYPES
// ============================================

export interface TranscriptSegment {
  text: string;
  offset: number;      // Start time in milliseconds
  duration: number;    // Duration in milliseconds
}

export interface FormattedTranscript {
  segments: TranscriptSegment[];
  fullText: string;
  sections: TranscriptSection[];
  totalDuration: number;
}

export interface TranscriptSection {
  startTime: number;
  endTime: number;
  title: string;
  content: string;
  timestamp: string;
}

// ============================================
// COMMENT TYPES
// ============================================

export interface YouTubeComment {
  text: string;
  author: string;
  likes: number;
  replies: number;
  publishedAt: string;
  isReply?: boolean;
}

export interface ScrapedData {
  videoId: string;
  videoTitle: string;
  videoDescription: string;
  channelName: string;
  channelUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
  duration: string;
  comments: YouTubeComment[];
  transcript?: FormattedTranscript;
}

// ============================================
// ANALYSIS TYPES
// ============================================

export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'mixed' | 'neutral';
  score: number;
  distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  positiveDrivers: string[];
  negativeDrivers: string[];
}

export interface KnowledgeGap {
  topic: string;
  questionCount: number;
  sampleQuestions: string[];
  suggestedContent: string;
  relatedTranscriptSection?: string;
}

export interface DemandSignal {
  request: string;
  frequency: number;
  urgency: 'high' | 'medium' | 'low';
  sampleComments: string[];
  businessPotential: string;
}

export interface MythMisconception {
  myth: string;
  prevalence: number;
  correction: string;
  sampleComments: string[];
  transcriptReference?: string;
}

export interface PainPoint {
  problem: string;
  intensity: 'severe' | 'moderate' | 'mild';
  frequency: number;
  sampleComments: string[];
  potentialSolution: string;
}

export interface ContentResonance {
  whatWorked: ResonanceItem[];
  whatFlopped: ResonanceItem[];
}

export interface ResonanceItem {
  aspect: string;
  evidence: string[];
  sentiment: 'positive' | 'negative';
  transcriptTimestamp?: string;
}

// ============================================
// NEW: TRANSCRIPT-ENHANCED ANALYSIS TYPES
// ============================================

export interface HookAnalysis {
  hookType: 'curiosity' | 'pain-point' | 'promise' | 'story' | 'question' | 'statistic' | 'contrast';
  hookText: string;
  effectiveness: 'strong' | 'moderate' | 'weak';
  clarityScore: number;
  timeToHook: number;
  commentFeedback: string[];
  improvements: string[];
}

export interface ScriptStructure {
  totalSections: number;
  sections: ScriptSection[];
  flowScore: number;
  transitionQuality: 'smooth' | 'adequate' | 'choppy';
  logicalGaps: string[];
  redundancies: string[];
}

export interface ScriptSection {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  duration: number;
  content: string;
  purpose: string;
  relatedComments: SectionComment[];
  sentimentInSection: 'positive' | 'negative' | 'neutral' | 'mixed';
}

export interface SectionComment {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  mentionsTimestamp: boolean;
  timestamp?: string;
}

export interface ContentGapAnalysis {
  promisedContent: string[];
  deliveredContent: string[];
  missingPieces: ContentGap[];
  unexpectedBonuses: string[];
}

export interface ContentGap {
  topic: string;
  viewerExpectation: string;
  actualCoverage: string;
  viewerFeedback: string[];
  recommendation: string;
}

export interface PacingAnalysis {
  overallPace: 'too-fast' | 'optimal' | 'too-slow' | 'inconsistent';
  averageWordsPerMinute: number;
  fastSections: PacingSection[];
  slowSections: PacingSection[];
  commentFeedback: string[];
}

export interface PacingSection {
  timestamp: string;
  description: string;
  wordsPerMinute: number;
}

export interface EngagementPrediction {
  predictedDropOffPoints: DropOffPoint[];
  highEngagementMoments: EngagementMoment[];
  retentionTips: string[];
}

export interface DropOffPoint {
  timestamp: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  fix: string;
}

export interface EngagementMoment {
  timestamp: string;
  reason: string;
  commentEvidence: string[];
}

// ============================================
// COMPLETE ANALYSIS RESULT
// ============================================

export interface DeepAnalysisResult {
  // Video metadata
  videoId: string;
  videoTitle: string;
  analyzedAt: string;
  
  // Data sources used
  dataSourcesSummary: {
    commentsAnalyzed: number;
    transcriptAvailable: boolean;
    transcriptDuration?: string;
    transcriptWordCount?: number;
  };
  
  // Original analysis (comment-based)
  sentiment: SentimentAnalysis;
  knowledgeGaps: KnowledgeGap[];
  demandSignals: DemandSignal[];
  myths: MythMisconception[];
  painPoints: PainPoint[];
  resonance: ContentResonance;
  
  // NEW: Transcript-enhanced analysis
  hookAnalysis?: HookAnalysis;
  scriptStructure?: ScriptStructure;
  contentGaps?: ContentGapAnalysis;
  pacingAnalysis?: PacingAnalysis;
  engagementPrediction?: EngagementPrediction;
  
  // Actionable recommendations
  topRecommendations: string[];
  contentIdeas: string[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ScrapeResponse {
  success: boolean;
  data?: ScrapedData;
  error?: string;
}

export interface TranscriptResponse {
  success: boolean;
  transcript?: FormattedTranscript;
  error?: string;
  message?: string;
}

export interface AnalyzeResponse {
  success: boolean;
  analysis?: DeepAnalysisResult;
  error?: string;
}

// ============================================
// UI STATE TYPES
// ============================================

export type AnalysisStep = 
  | 'idle'
  | 'fetching-comments'
  | 'fetching-transcript'
  | 'analyzing'
  | 'complete'
  | 'error';

export interface AnalysisProgress {
  step: AnalysisStep;
  message: string;
  progress: number;
}

export type AIModel =
  // Free models
  | 'x-ai/grok-4.1-fast:free'
  | 'openai/gpt-oss-20b:free'
  | 'z-ai/glm-4.5-air:free'
  // Paid models
  | 'google/gemini-3-pro-preview'
  | 'openai/gpt-5.1'
  | 'openai/gpt-4o-mini'
  | 'openai/gpt-4o'
  | 'openai/gpt-oss-120b:exacto'
  | 'anthropic/claude-haiku-4.5'
  | 'anthropic/claude-opus-4.5'
  | 'anthropic/claude-sonnet-4.5'
  | 'anthropic/claude-sonnet-4'
  | 'x-ai/grok-4'
  | 'x-ai/grok-3-mini'
  | 'x-ai/grok-4-fast'
  | 'z-ai/glm-4.6'
  | 'z-ai/glm-4.5';

export interface ModelOption {
  id: AIModel;
  name: string;
  description: string;
  contextWindow: string;
  costTier: 'free' | 'low' | 'medium' | 'high';
  category: 'free' | 'paid';
}

export const AI_MODELS: ModelOption[] = [
  // Free Models
  {
    id: 'x-ai/grok-4.1-fast:free',
    name: 'Grok 4.1 Fast (Free)',
    description: 'Fast & free - Default model',
    contextWindow: '128K tokens',
    costTier: 'free',
    category: 'free'
  },
  {
    id: 'openai/gpt-oss-20b:free',
    name: 'GPT OSS 20B (Free)',
    description: 'Open source model, free tier',
    contextWindow: '64K tokens',
    costTier: 'free',
    category: 'free'
  },
  {
    id: 'z-ai/glm-4.5-air:free',
    name: 'GLM 4.5 Air (Free)',
    description: 'Lightweight & free',
    contextWindow: '128K tokens',
    costTier: 'free',
    category: 'free'
  },
  // Paid Models - Google
  {
    id: 'google/gemini-3-pro-preview',
    name: 'Gemini 3 Pro',
    description: 'Highest quality, 2M context window',
    contextWindow: '2M tokens',
    costTier: 'high',
    category: 'paid'
  },
  // Paid Models - OpenAI
  {
    id: 'openai/gpt-5.1',
    name: 'GPT-5.1',
    description: 'Latest GPT model',
    contextWindow: '200K tokens',
    costTier: 'high',
    category: 'paid'
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'Multimodal flagship',
    contextWindow: '128K tokens',
    costTier: 'medium',
    category: 'paid'
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Fast & affordable',
    contextWindow: '128K tokens',
    costTier: 'low',
    category: 'paid'
  },
  {
    id: 'openai/gpt-oss-120b:exacto',
    name: 'GPT OSS 120B',
    description: 'Large open source model',
    contextWindow: '128K tokens',
    costTier: 'medium',
    category: 'paid'
  },
  // Paid Models - Anthropic
  {
    id: 'anthropic/claude-opus-4.5',
    name: 'Claude Opus 4.5',
    description: 'Most capable Claude model',
    contextWindow: '200K tokens',
    costTier: 'high',
    category: 'paid'
  },
  {
    id: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    description: 'Balanced performance',
    contextWindow: '200K tokens',
    costTier: 'medium',
    category: 'paid'
  },
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    description: 'Proven reliability',
    contextWindow: '200K tokens',
    costTier: 'medium',
    category: 'paid'
  },
  {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    description: 'Fast & economical',
    contextWindow: '200K tokens',
    costTier: 'low',
    category: 'paid'
  },
  // Paid Models - X.AI
  {
    id: 'x-ai/grok-4',
    name: 'Grok 4',
    description: 'Latest Grok model',
    contextWindow: '128K tokens',
    costTier: 'high',
    category: 'paid'
  },
  {
    id: 'x-ai/grok-4-fast',
    name: 'Grok 4 Fast',
    description: 'Optimized for speed',
    contextWindow: '128K tokens',
    costTier: 'medium',
    category: 'paid'
  },
  {
    id: 'x-ai/grok-3-mini',
    name: 'Grok 3 Mini',
    description: 'Compact & efficient',
    contextWindow: '64K tokens',
    costTier: 'low',
    category: 'paid'
  },
  // Paid Models - Z.AI
  {
    id: 'z-ai/glm-4.6',
    name: 'GLM 4.6',
    description: 'Latest GLM release',
    contextWindow: '128K tokens',
    costTier: 'medium',
    category: 'paid'
  },
  {
    id: 'z-ai/glm-4.5',
    name: 'GLM 4.5',
    description: 'Stable GLM version',
    contextWindow: '128K tokens',
    costTier: 'low',
    category: 'paid'
  }
];

// ============================================
// HISTORY / FIREBASE TYPES
// ============================================

export interface HistoryItem {
  id: string;
  videoId: string;
  videoTitle: string;
  videoChannel: string;
  videoUrl: string;
  modelUsed: string;
  totalComments: number;
  createdAt: string;
  analysis?: DeepAnalysisResult;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface SaveHistoryRequest {
  videoId: string;
  videoTitle: string;
  videoChannel: string;
  videoUrl: string;
  modelUsed: string;
  totalComments: number;
  analysis: DeepAnalysisResult;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

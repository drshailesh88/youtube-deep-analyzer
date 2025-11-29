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
// AUDIENCE PROFILE TYPES
// ============================================

export interface AudienceAvatar {
  description: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  mainGoal: string;
  currentSituation: string;
  desiredOutcome: string;
  evidenceFromComments: string[];
}

export interface SecondaryAvatar {
  description: string;
  percentage: string;
  evidence: string[];
}

export interface AudienceProfile {
  primaryAvatar: AudienceAvatar;
  secondaryAvatars: SecondaryAvatar[];
  surprisingInsight: string;
}

// ============================================
// SENTIMENT TYPES
// ============================================

export interface EmotionalBreakdown {
  gratitude: number;
  excitement: number;
  confusion: number;
  frustration: number;
  skepticism: number;
  inspiration: number;
}

export interface SentimentDriver {
  driver: string;
  intensity: 'strong' | 'moderate' | 'mild';
  frequency: number;
  sampleComments: string[];
  transcriptReference?: string;
  howToFix?: string;
}

export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'mixed' | 'neutral';
  score: number;
  distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  emotionalBreakdown?: EmotionalBreakdown;
  emotionalJourney?: Array<{
    timestamp: string;
    emotion: string;
    trigger: string;
    evidence: string[];
  }>;
  positiveDrivers: SentimentDriver[];
  negativeDrivers: SentimentDriver[];
}

// ============================================
// HOOK ANALYSIS TYPES
// ============================================

export interface HookAttentionGrab {
  score: number;
  whatWorked: string;
  whatFailed: string;
  viewerReactions: string[];
}

export interface HookClarityOfPromise {
  score: number;
  promiseMade: string;
  isPromiseClear: boolean;
  viewerExpectations: string[];
}

export interface HookCuriosity {
  score: number;
  openLoops: string[];
  tensionBuilt: string;
}

export interface ImprovedHook {
  script: string;
  whyBetter: string;
  psychologicalTriggers: string[];
}

export interface HookAnalysis {
  hookTimestamp?: string;
  hookTranscript?: string;
  hookType: 'curiosity' | 'pain-agitation' | 'promise' | 'story' | 'question' | 'statistic' | 'pattern-interrupt' | 'contrast' | 'controversy' | 'pain-point';
  hookStrength?: number;
  effectiveness?: 'strong' | 'moderate' | 'weak';
  clarityScore?: number;
  timeToHook?: number;
  hookAnalysis?: {
    attentionGrab: HookAttentionGrab;
    clarityOfPromise: HookClarityOfPromise;
    curiosityGenerated: HookCuriosity;
    timeToHook: number;
    wastes: string[];
  };
  improvedHook?: ImprovedHook;
  hookText?: string;
  commentFeedback?: string[];
  improvements?: string[];
}

// ============================================
// SCRIPT STRUCTURE TYPES
// ============================================

export interface SectionViewerReactions {
  positive: string[];
  negative: string[];
  questions: string[];
}

export interface ScriptSection {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  duration: string | number;
  purpose: string;
  summary?: string;
  content?: string;
  keyQuotes?: string[];
  viewerReactions?: SectionViewerReactions;
  relatedComments?: SectionComment[];
  effectiveness?: number;
  issues?: string[];
  improvements?: string[];
  sentimentInSection?: 'positive' | 'negative' | 'neutral' | 'mixed';
}

export interface SectionComment {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  mentionsTimestamp: boolean;
  timestamp?: string;
}

export interface StructureIssue {
  issue: string;
  location: string;
  impact: string;
  fix: string;
}

export interface ScriptStructure {
  overallStructure?: string;
  totalSections: number;
  sections: ScriptSection[];
  structureScore?: number;
  flowScore?: number;
  transitionQuality?: 'smooth' | 'adequate' | 'choppy';
  structureIssues?: StructureIssue[];
  missingElements?: string[];
  unnecessaryElements?: string[];
  logicalGaps?: string[];
  redundancies?: string[];
}

// ============================================
// CONTENT DELIVERY TYPES
// ============================================

export interface PacingIssue {
  timestamp: string;
  issue: string;
  transcript?: string;
  description?: string;
  wordsPerMinute?: number;
  viewerFeedback?: string[];
  fix?: string;
}

export interface PacingAnalysis {
  overallPace: 'too-fast' | 'optimal' | 'too-slow' | 'inconsistent';
  averageWPM?: number;
  averageWordsPerMinute?: number;
  pacingIssues?: PacingIssue[];
  fastSections?: PacingIssue[];
  slowSections?: PacingIssue[];
  commentFeedback?: string[];
}

export interface ConfusingMoment {
  timestamp: string;
  transcript: string;
  whyConfusing: string;
  viewerConfusion: string[];
  clearerVersion: string;
}

export interface ClarityAnalysis {
  overallClarity: number;
  confusingMoments: ConfusingMoment[];
  jargonUsed: string[];
  assumptionsMade: string[];
}

export interface EnergyDip {
  timestamp: string;
  issue: string;
  viewerReactions: string[];
}

export interface EnergyAndTone {
  overallEnergy: 'low' | 'medium' | 'high' | 'variable';
  toneMatch: string;
  energyDips: EnergyDip[];
  recommendations: string[];
}

export interface EngagementTechniques {
  techniquesUsed: string[];
  techniquesEffectiveness: string;
  missingTechniques: string[];
  viewerEngagementComments: string[];
}

export interface ContentDelivery {
  pacingAnalysis: PacingAnalysis;
  clarityAnalysis?: ClarityAnalysis;
  engagementTechniques?: EngagementTechniques;
  energyAndTone?: EnergyAndTone;
}

// ============================================
// CONTENT GAPS TYPES
// ============================================

export interface PromiseVsDeliveryGap {
  promised: string;
  delivered: string;
  viewerReactions: string[];
  howToFix: string;
}

export interface PromiseVsDelivery {
  titlePromise: string;
  thumbnailPromise?: string;
  hookPromise: string;
  actualDelivery: string;
  matchScore: number;
  gaps: PromiseVsDeliveryGap[];
}

export interface MissingContent {
  topic: string;
  evidence: string[];
  shouldHaveBeenAt: string;
  howToInclude: string;
}

export interface UnnecessaryContent {
  content: string;
  timestamp: string;
  whyCut: string;
  viewerSkipIndicators: string[];
}

export interface UnexpectedValue {
  content: string;
  viewerReactions: string[];
  howToExpand: string;
}

export interface ContentGapAnalysis {
  promiseVsDelivery?: PromiseVsDelivery;
  promisedContent?: string[];
  deliveredContent?: string[];
  missingContent?: MissingContent[];
  missingPieces?: ContentGap[];
  unnecessaryContent?: UnnecessaryContent[];
  unexpectedValue?: UnexpectedValue[];
  unexpectedBonuses?: string[];
}

export interface ContentGap {
  topic: string;
  viewerExpectation: string;
  actualCoverage: string;
  viewerFeedback: string[];
  recommendation: string;
}

// ============================================
// ENGAGEMENT PREDICTION TYPES
// ============================================

export interface RetentionMoment {
  timestamp: string;
  content: string;
  whyStrong?: string;
  reason?: string;
  evidence: string[];
}

export interface DropOffPoint {
  timestamp: string;
  content?: string;
  whyDropOff?: string;
  reason?: string;
  severity: 'critical' | 'moderate' | 'minor' | 'high' | 'medium' | 'low';
  evidence?: string[];
  fix: string;
}

export interface ReplayMoment {
  timestamp: string;
  content: string;
  whyReplay: string;
  evidence: string[];
}

export interface CTAEffectiveness {
  ctaTimestamp: string;
  ctaTranscript: string;
  ctaType: string;
  effectiveness: number;
  viewerResponse: string[];
  improvedCTA: string;
}

export interface RetentionCurve {
  predictedPattern: string;
  strongRetentionMoments: RetentionMoment[];
  dropOffPoints: DropOffPoint[];
}

export interface EngagementPrediction {
  retentionCurve?: RetentionCurve;
  predictedDropOffPoints?: DropOffPoint[];
  highEngagementMoments?: EngagementMoment[];
  replayMoments?: ReplayMoment[];
  ctaEffectiveness?: CTAEffectiveness;
  retentionTips?: string[];
}

export interface EngagementMoment {
  timestamp: string;
  reason: string;
  commentEvidence: string[];
}

// ============================================
// PAIN POINTS & DESIRES TYPES
// ============================================

export interface VideoIdea {
  title: string;
  hook: string;
  angle?: string;
  keyPoints?: string[];
  differentiator?: string;
}

export interface ContentOpportunity {
  title: string;
  hook: string;
  angle?: string;
}

export interface AddressedInVideo {
  wasAddressed: boolean;
  timestamp?: string;
  howWellAddressed?: number;
  whatWasSaid?: string;
  viewerSatisfaction?: string;
  effectiveness?: number;
}

export interface PainPoint {
  pain: string;
  problem?: string;
  intensity: 'severe' | 'moderate' | 'mild';
  frequency: number;
  emotionalWeight?: string;
  sampleComments: string[];
  rootCause?: string;
  desiredSolution?: string;
  addressedInVideo?: AddressedInVideo;
  contentOpportunity?: ContentOpportunity;
  proposedTitle?: string;
  proposedHook?: string;
  potentialSolution?: string;
}

export interface AudienceDesire {
  desire: string;
  urgency: 'desperate' | 'strong' | 'moderate' | 'casual';
  frequency: number;
  currentBlocker?: string;
  sampleComments: string[];
  addressedInVideo?: AddressedInVideo;
  contentOpportunity?: ContentOpportunity;
  contentAngle?: string;
  proposedTitle?: string;
  proposedHook?: string;
}

export interface Objection {
  objection: string;
  frequency: number;
  validity: 'valid' | 'partially-valid' | 'misconception';
  sampleComments: string[];
  addressedInVideo?: AddressedInVideo;
  howToAddress?: string;
  betterResponse?: string;
  preventionStrategy?: string;
}

// ============================================
// KNOWLEDGE GAPS & DEMAND TYPES
// ============================================

export interface RelatedTranscriptMoment {
  timestamp: string;
  whatWasSaid: string;
  whyConfusing: string;
}

export interface KnowledgeGap {
  topic: string;
  confusionLevel?: 'completely-lost' | 'partially-confused' | 'needs-clarification';
  frequency?: number;
  questionCount?: number;
  sampleQuestions: string[];
  whatTheyThink?: string;
  whatTheyNeed?: string;
  explanationStrategy?: string;
  relatedTranscriptMoment?: RelatedTranscriptMoment;
  relatedTranscriptSection?: string;
  videoIdea?: VideoIdea;
  suggestedContent?: string;
}

export interface DemandSignal {
  request: string;
  frequency: number;
  urgency: 'high' | 'medium' | 'low';
  willingness?: string;
  sampleComments: string[];
  relatedToVideoMoment?: string;
  videoIdea?: VideoIdea;
  businessPotential?: string;
}

// ============================================
// RESONANCE & VIRAL TYPES
// ============================================

export interface QuotableLine {
  timestamp: string;
  quote: string;
  whyQuotable: string;
  viewerReactions: string[];
  howToReplicate: string;
}

export interface ResonanceItem {
  element: string;
  aspect?: string;
  timestamp?: string;
  transcript?: string;
  whyItWorked?: string;
  whyItFailed?: string;
  evidence: string[];
  howToReplicate?: string;
  howToFix?: string;
  sentiment?: 'positive' | 'negative';
  transcriptTimestamp?: string;
}

export interface ContentResonance {
  whatWorked: ResonanceItem[];
  whatFlopped: ResonanceItem[];
}

export interface ViralElements {
  shareabilityScore: number;
  shareabilityReason: string;
  quotableLines: string[];
  controversialPoints: string[];
  emotionalPeaks: string[];
  memeability: string;
}

// ============================================
// COMPETITOR & SUBSCRIBER TYPES
// ============================================

export interface CompetitorMention {
  competitor: string;
  context: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  frequency: number;
  strategicInsight: string;
}

export interface SubscriberConversion {
  newSubscriberIndicators: number;
  subscribeResistance: string[];
  subscribeTriggers: string[];
  ctaEffectiveness: string;
}

// ============================================
// NEXT VIDEO BLUEPRINT TYPES
// ============================================

export interface BlueprintHook {
  type: string;
  script: string;
  psychologicalTriggers: string[];
}

export interface BlueprintSection {
  section: string;
  duration: string;
  content: string;
  technique: string;
}

export interface HighestPotentialTopic {
  topic: string;
  whyThisTopic: string;
  title: string;
  thumbnailConcept?: string;
  thumbnail?: string;
  hook: BlueprintHook | string;
  outline: BlueprintSection[] | string[];
  mustInclude: string[];
  mustAvoid: string[];
  callToAction?: string;
  predictedPerformance: string;
}

export interface AlternativeTopic {
  topic: string;
  title: string;
  hook: string;
  evidence: string;
  angle?: string;
  differentiator?: string;
}

export interface NextVideoBlueprint {
  highestPotentialTopic: HighestPotentialTopic;
  alternativeTopics: AlternativeTopic[];
}

// ============================================
// SCRIPT IMPROVEMENTS TYPES
// ============================================

export interface ScriptIssue {
  issue: string;
  timestamp: string;
  currentScript: string;
  improvedScript: string;
  expectedImpact: string;
}

export interface LengthRecommendation {
  currentLength: string;
  optimalLength: string;
  reasoning: string;
}

export interface ScriptImprovements {
  overallScore: number;
  topIssues: ScriptIssue[];
  structureRecommendation: string;
  lengthRecommendation: LengthRecommendation;
}

// ============================================
// RECOMMENDATION TYPES
// ============================================

export interface TopRecommendation {
  priority: number;
  category?: 'hook' | 'structure' | 'content' | 'delivery' | 'cta';
  recommendation: string;
  reasoning: string;
  implementation: string;
  exampleScript?: string;
  expectedImpact: string;
}

// ============================================
// LEGACY TYPES (for backward compatibility)
// ============================================

export interface MythMisconception {
  myth: string;
  prevalence: number;
  correction: string;
  sampleComments: string[];
  transcriptReference?: string;
}

// ============================================
// COMPLETE ANALYSIS RESULT
// ============================================

export interface DeepAnalysisResult {
  // Video metadata
  videoId: string;
  videoTitle: string;
  channelName?: string;
  analyzedAt: string;
  model?: string;
  
  // Data sources used
  dataSourcesSummary: {
    commentsAnalyzed: number;
    transcriptAvailable: boolean;
    transcriptDuration?: string;
    transcriptWordCount?: number;
    wordsPerMinute?: number;
    analysisDepth?: string;
  };
  
  // Audience insights
  audienceProfile?: AudienceProfile;
  sentiment: SentimentAnalysis;
  painPoints: PainPoint[];
  audienceDesires?: AudienceDesire[];
  objections?: Objection[];
  knowledgeGaps: KnowledgeGap[];
  demandSignals: DemandSignal[];
  
  // Content analysis
  hookAnalysis?: HookAnalysis;
  scriptStructure?: ScriptStructure;
  contentDelivery?: ContentDelivery;
  contentGaps?: ContentGapAnalysis;
  engagementPrediction?: EngagementPrediction;
  pacingAnalysis?: PacingAnalysis;
  
  // Resonance & viral
  quotableLines?: QuotableLine[];
  resonance: ContentResonance;
  viralElements?: ViralElements;
  competitorMentions?: CompetitorMention[];
  subscriberConversion?: SubscriberConversion;
  
  // Actionable outputs
  nextVideoBlueprint?: NextVideoBlueprint;
  scriptImprovements?: ScriptImprovements;
  topRecommendations: TopRecommendation[] | string[];
  blindSpots?: string[];
  
  // Legacy fields
  myths: MythMisconception[];
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

export interface SaveHistoryRequest {
  videoId: string;
  videoTitle: string;
  videoChannel?: string;
  videoUrl: string;
  modelUsed: string;
  totalComments?: number;
  analysis: DeepAnalysisResult;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface HistoryItem {
  id: string;
  videoId: string;
  videoTitle: string;
  videoChannel: string;
  modelUsed: string;
  totalComments: number;
  createdAt: string;
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

export type AIModel = string;

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  contextWindow: string;
  category: 'free' | 'paid';
  costTier: 'free' | 'low' | 'medium' | 'high';
}

export const AI_MODELS: ModelOption[] = [
  // FREE Models (3 total - Default: Grok 4.1 Fast)
  {
    id: 'x-ai/grok-4.1-fast:free',
    name: 'Grok 4.1 Fast (Free)',
    description: 'Default, 2M context, agentic',
    contextWindow: '2M tokens',
    category: 'free',
    costTier: 'free'
  },
  {
    id: 'openai/gpt-oss-20b:free',
    name: 'GPT OSS 20B (Free)',
    description: 'Open source, 20B params',
    contextWindow: '128K tokens',
    category: 'free',
    costTier: 'free'
  },
  {
    id: 'z-ai/glm-4.5-air:free',
    name: 'GLM 4.5 Air (Free)',
    description: 'Zhipu AI lightweight',
    contextWindow: '128K tokens',
    category: 'free',
    costTier: 'free'
  },

  // PAID Models - Google (3 models)
  {
    id: 'google/gemini-3-pro-preview',
    name: 'Gemini 3 Pro',
    description: 'Latest, 1M context',
    contextWindow: '1M tokens',
    category: 'paid',
    costTier: 'high'
  },
  {
    id: 'google/gemini-2.5-pro-preview-06-05',
    name: 'Gemini 2.5 Pro',
    description: 'High quality',
    contextWindow: '1M tokens',
    category: 'paid',
    costTier: 'high'
  },
  {
    id: 'google/gemini-2.5-flash-preview-05-20',
    name: 'Gemini 2.5 Flash',
    description: 'Fast & cheap',
    contextWindow: '1M tokens',
    category: 'paid',
    costTier: 'medium'
  },

  // PAID Models - OpenAI (4 models)
  {
    id: 'openai/gpt-5.1',
    name: 'GPT-5.1',
    description: 'Most advanced, 400K context',
    contextWindow: '400K tokens',
    category: 'paid',
    costTier: 'high'
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Compact, cost-effective',
    contextWindow: '128K tokens',
    category: 'paid',
    costTier: 'low'
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'Flagship multimodal',
    contextWindow: '128K tokens',
    category: 'paid',
    costTier: 'medium'
  },
  {
    id: 'openai/gpt-oss-120b:exacto',
    name: 'GPT OSS 120B',
    description: 'Large open source',
    contextWindow: '128K tokens',
    category: 'paid',
    costTier: 'medium'
  },

  // PAID Models - Anthropic Claude (4 models)
  {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    description: 'Fastest, low latency',
    contextWindow: '200K tokens',
    category: 'paid',
    costTier: 'low'
  },
  {
    id: 'anthropic/claude-opus-4.5',
    name: 'Claude Opus 4.5',
    description: 'Most capable',
    contextWindow: '200K tokens',
    category: 'paid',
    costTier: 'high'
  },
  {
    id: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    description: 'Balanced',
    contextWindow: '200K tokens',
    category: 'paid',
    costTier: 'medium'
  },
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    description: 'Previous gen',
    contextWindow: '200K tokens',
    category: 'paid',
    costTier: 'medium'
  },

  // PAID Models - xAI Grok (3 models)
  {
    id: 'x-ai/grok-4',
    name: 'Grok 4',
    description: 'Flagship reasoning',
    contextWindow: '128K tokens',
    category: 'paid',
    costTier: 'high'
  },
  {
    id: 'x-ai/grok-3-mini',
    name: 'Grok 3 Mini',
    description: 'Compact version',
    contextWindow: '128K tokens',
    category: 'paid',
    costTier: 'low'
  },
  {
    id: 'x-ai/grok-4-fast',
    name: 'Grok 4 Fast',
    description: 'Optimized speed',
    contextWindow: '128K tokens',
    category: 'paid',
    costTier: 'medium'
  },

  // PAID Models - Zhipu AI (2 models)
  {
    id: 'z-ai/glm-4.6',
    name: 'GLM 4.6',
    description: 'Latest version',
    contextWindow: '128K tokens',
    category: 'paid',
    costTier: 'medium'
  },
  {
    id: 'z-ai/glm-4.5',
    name: 'GLM 4.5',
    description: 'General purpose',
    contextWindow: '128K tokens',
    category: 'paid',
    costTier: 'medium'
  }
];

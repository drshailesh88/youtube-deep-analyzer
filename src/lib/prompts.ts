import { ScrapedData, FormattedTranscript } from './types';

// Helper to format timestamp from milliseconds
function formatTimestamp(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

// Helper to chunk transcript with timestamps
function formatTranscriptWithTimestamps(transcript: FormattedTranscript): string {
  const chunks: string[] = [];
  let currentChunk = '';
  let chunkStartTime = 0;
  
  for (const segment of transcript.segments) {
    if (currentChunk.length > 500) {
      const timestamp = formatTimestamp(chunkStartTime);
      chunks.push(`[${timestamp}] ${currentChunk.trim()}`);
      currentChunk = '';
      chunkStartTime = segment.offset;
    }
    currentChunk += segment.text + ' ';
  }
  
  if (currentChunk.trim()) {
    const timestamp = formatTimestamp(chunkStartTime);
    chunks.push(`[${timestamp}] ${currentChunk.trim()}`);
  }
  
  return chunks.join('\n\n');
}

// Calculate engagement metrics
function calculateEngagementMetrics(data: ScrapedData): string {
  const likeToView = data.viewCount > 0 ? ((data.likeCount / data.viewCount) * 100).toFixed(2) : '0';
  const commentToView = data.viewCount > 0 ? ((data.commentCount / data.viewCount) * 100).toFixed(4) : '0';
  const avgLikesPerComment = data.comments.length > 0 
    ? (data.comments.reduce((sum, c) => sum + c.likes, 0) / data.comments.length).toFixed(1)
    : '0';
  
  // Find most engaged comments (high likes)
  const topComments = [...data.comments]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 20);
  
  // Find questions (comments with ?)
  const questions = data.comments.filter(c => c.text.includes('?'));
  
  // Find negative sentiment indicators
  const negativeIndicators = ['disappointed', 'waste', 'bad', 'wrong', 'hate', 'dislike', 'boring', 'clickbait', 'misleading'];
  const negativeComments = data.comments.filter(c => 
    negativeIndicators.some(word => c.text.toLowerCase().includes(word))
  );
  
  // Find positive sentiment indicators  
  const positiveIndicators = ['amazing', 'great', 'love', 'best', 'helpful', 'thank', 'awesome', 'excellent', 'perfect', 'saved'];
  const positiveComments = data.comments.filter(c =>
    positiveIndicators.some(word => c.text.toLowerCase().includes(word))
  );

  return `
## ENGAGEMENT METRICS (Pre-calculated)
- Like/View Ratio: ${likeToView}% ${parseFloat(likeToView) > 4 ? '(Excellent)' : parseFloat(likeToView) > 2 ? '(Good)' : '(Below average)'}
- Comment/View Ratio: ${commentToView}%
- Average Likes per Comment: ${avgLikesPerComment}
- Questions in Comments: ${questions.length} (${((questions.length / data.comments.length) * 100).toFixed(1)}%)
- Detected Positive Comments: ~${positiveComments.length}
- Detected Negative Comments: ~${negativeComments.length}

## TOP 20 MOST-LIKED COMMENTS (These represent what resonated most)
${topComments.map((c, i) => `${i + 1}. [${c.likes} likes] "${c.text.slice(0, 300)}${c.text.length > 300 ? '...' : ''}"`).join('\n')}

## QUESTIONS FROM VIEWERS (${questions.length} total - showing top 30)
${questions.slice(0, 30).map((c, i) => `${i + 1}. [${c.likes} likes] "${c.text.slice(0, 200)}"`).join('\n')}
`;
}

export function buildDeepAnalysisPrompt(data: ScrapedData): string {
  const hasTranscript = data.transcript && data.transcript.fullText.length > 0;
  
  // Format comments with more context
  const formattedComments = data.comments
    .slice(0, 1500)
    .map((c, i) => `[${i + 1}] (${c.likes} likes${c.replies > 0 ? `, ${c.replies} replies` : ''}) ${c.text}`)
    .join('\n');
  
  // Format transcript if available
  const transcriptSection = hasTranscript 
    ? `
## VIDEO TRANSCRIPT (Full script with timestamps)
Duration: ${Math.floor(data.transcript!.totalDuration / 60000)} minutes ${Math.floor((data.transcript!.totalDuration % 60000) / 1000)} seconds
Word Count: ~${data.transcript!.fullText.split(/\s+/).length} words
Estimated Speaking Rate: ~${Math.round(data.transcript!.fullText.split(/\s+/).length / (data.transcript!.totalDuration / 60000))} words/minute

${formatTranscriptWithTimestamps(data.transcript!)}
`
    : '';

  const engagementMetrics = calculateEngagementMetrics(data);

  const systemContext = `You are an elite YouTube content strategist who has helped channels grow from 0 to 1M+ subscribers. You combine deep audience psychology, content strategy, and data analysis to provide insights that creators can immediately act on.

Your analysis style:
- You think like a creator who needs to make their NEXT video better
- You focus on SPECIFIC, ACTIONABLE insights (not generic advice)
- You identify exact moments, phrases, and patterns that worked or failed
- You understand audience psychology: why people watch, comment, share, and subscribe
- You extract concrete video ideas with titles, angles, and hooks
- You are brutally honest about what's not working

Your goal: Help this creator understand their audience so deeply that their next video performs 2-3x better.`;

  const basePrompt = `${systemContext}

===========================================
VIDEO DATA FOR ANALYSIS
===========================================

## VIDEO METADATA
- Title: "${data.videoTitle}"
- Channel: ${data.channelName}
- Views: ${data.viewCount.toLocaleString()}
- Likes: ${data.likeCount.toLocaleString()}
- Comments: ${data.commentCount.toLocaleString()}
- Published: ${data.publishedAt}
- Duration: ${data.duration}

## VIDEO DESCRIPTION
${data.videoDescription?.slice(0, 3000) || 'No description available'}

${engagementMetrics}
${transcriptSection}

## ALL COMMENTS (${data.comments.length} total)
${formattedComments}

===========================================
ANALYSIS FRAMEWORK
===========================================

${hasTranscript ? getTranscriptEnhancedInstructions() : getCommentOnlyInstructions()}

CRITICAL REQUIREMENTS:
1. Every insight must include SPECIFIC evidence (quotes, timestamps, patterns)
2. Every recommendation must be IMMEDIATELY actionable (not "consider doing X")
3. Content ideas must include proposed titles, hooks, and angles
4. Be specific about WHAT to say, HOW to say it, and WHEN to say it
5. Your response must be valid JSON matching the exact structure below

DO NOT:
- Give generic advice like "engage with your audience" or "be more consistent"
- Provide insights without specific evidence from the data
- Suggest vague content ideas without concrete angles
- Ignore negative feedback or criticism in comments`;

  return basePrompt;
}

function getCommentOnlyInstructions(): string {
  return `
Since no transcript is available, focus your analysis on extracting maximum insight from comments.

Analyze the comments with these specific lenses:

1. AUDIENCE AVATAR: Who is watching? What's their skill level, situation, goals?
2. EMOTIONAL TRIGGERS: What made people comment? Joy, frustration, curiosity, disagreement?
3. CONTENT GAPS: What did viewers expect but not get? What questions remain?
4. VIRAL MOMENTS: Which parts got the most engagement? Why?
5. OBJECTIONS: What resistance or skepticism exists?
6. TRANSFORMATION: What change do viewers want? Before → After state?

Return your analysis in this EXACT JSON structure:

{
  "dataSourcesSummary": {
    "commentsAnalyzed": <number>,
    "transcriptAvailable": false,
    "analysisDepth": "comment-only"
  },
  
  "audienceProfile": {
    "primaryAvatar": {
      "description": "<detailed description of typical viewer>",
      "skillLevel": "<beginner|intermediate|advanced|mixed>",
      "mainGoal": "<what they're trying to achieve>",
      "currentSituation": "<where they are now>",
      "desiredOutcome": "<where they want to be>",
      "evidenceFromComments": ["<supporting quotes>", "..."]
    },
    "secondaryAvatars": [
      {
        "description": "<other viewer type>",
        "percentage": "<estimated % of audience>",
        "evidence": ["<supporting quotes>"]
      }
    ],
    "surprisingInsight": "<something unexpected about this audience>"
  },
  
  "sentiment": {
    "overall": "<positive|negative|mixed|neutral>",
    "score": <-1.0 to 1.0>,
    "distribution": {
      "positive": <0-100>,
      "negative": <0-100>,
      "neutral": <0-100>
    },
    "emotionalBreakdown": {
      "gratitude": <0-100>,
      "excitement": <0-100>,
      "confusion": <0-100>,
      "frustration": <0-100>,
      "skepticism": <0-100>,
      "inspiration": <0-100>
    },
    "positiveDrivers": [
      {
        "driver": "<what viewers loved>",
        "intensity": "<strong|moderate|mild>",
        "frequency": <count>,
        "sampleComments": ["<exact quotes>", "..."]
      }
    ],
    "negativeDrivers": [
      {
        "driver": "<what viewers disliked>",
        "intensity": "<strong|moderate|mild>", 
        "frequency": <count>,
        "sampleComments": ["<exact quotes>", "..."],
        "howToFix": "<specific fix for next video>"
      }
    ]
  },
  
  "painPoints": [
    {
      "pain": "<specific problem viewers have>",
      "intensity": "<severe|moderate|mild>",
      "frequency": <count>,
      "emotionalWeight": "<how much this bothers them>",
      "sampleComments": ["<exact quotes showing this pain>", "..."],
      "rootCause": "<why they have this pain>",
      "desiredSolution": "<what they wish existed>",
      "contentOpportunity": "<video idea addressing this>",
      "proposedTitle": "<actual video title>",
      "proposedHook": "<first 10 seconds of that video>"
    }
  ],
  
  "audienceDesires": [
    {
      "desire": "<what they want to achieve/learn/become>",
      "urgency": "<desperate|strong|moderate|casual>",
      "frequency": <count>,
      "currentBlocker": "<what's stopping them>",
      "sampleComments": ["<exact quotes>", "..."],
      "contentAngle": "<how to create content for this desire>",
      "proposedTitle": "<actual video title>",
      "proposedHook": "<first 10 seconds>"
    }
  ],
  
  "objections": [
    {
      "objection": "<skepticism or resistance expressed>",
      "frequency": <count>,
      "validity": "<valid|partially-valid|misconception>",
      "sampleComments": ["<exact quotes>", "..."],
      "howToAddress": "<exactly what to say in future videos>",
      "preventionStrategy": "<how to prevent this objection>"
    }
  ],
  
  "knowledgeGaps": [
    {
      "topic": "<what viewers don't understand>",
      "confusionLevel": "<completely-lost|partially-confused|needs-clarification>",
      "frequency": <count>,
      "sampleQuestions": ["<exact questions from comments>", "..."],
      "whatTheyThink": "<their current misconception>",
      "whatTheyNeed": "<the correct understanding>",
      "explanationStrategy": "<how to explain this clearly>",
      "videoIdea": {
        "title": "<proposed title>",
        "hook": "<opening hook>",
        "keyPoints": ["<main points to cover>", "..."]
      }
    }
  ],
  
  "demandSignals": [
    {
      "request": "<what viewers explicitly asked for>",
      "frequency": <count>,
      "urgency": "<high|medium|low>",
      "willingness": "<how eager they are - would they pay? share?>",
      "sampleComments": ["<exact quotes>", "..."],
      "videoIdea": {
        "title": "<proposed title>",
        "hook": "<opening hook>",
        "angle": "<unique angle to take>",
        "differentiator": "<how to make it better than existing content>"
      }
    }
  ],
  
  "viralElements": {
    "shareabilityScore": <1-10>,
    "shareabilityReason": "<why people would/wouldn't share>",
    "quotableLines": ["<things people repeated in comments>", "..."],
    "controversialPoints": ["<things that sparked debate>", "..."],
    "emotionalPeaks": ["<moments that triggered strong reactions>", "..."],
    "memeability": "<did viewers make jokes/memes? what kind?>"
  },
  
  "resonance": {
    "whatWorked": [
      {
        "element": "<specific thing that resonated>",
        "whyItWorked": "<psychological reason>",
        "evidence": ["<supporting comments>", "..."],
        "howToReplicate": "<how to do this again>"
      }
    ],
    "whatFlopped": [
      {
        "element": "<what didn't work>",
        "whyItFailed": "<psychological reason>",
        "evidence": ["<supporting comments>", "..."],
        "howToFix": "<specific fix>"
      }
    ]
  },
  
  "competitorMentions": [
    {
      "competitor": "<other creator/channel/resource mentioned>",
      "context": "<why they mentioned it>",
      "sentiment": "<positive|negative|neutral>",
      "frequency": <count>,
      "strategicInsight": "<what this tells you about positioning>"
    }
  ],
  
  "subscriberConversion": {
    "newSubscriberIndicators": <count of "just subscribed" type comments>,
    "subscribeResistance": ["<reasons people might not subscribe>", "..."],
    "subscribeTriggers": ["<what made people subscribe>", "..."],
    "ctaEffectiveness": "<how well the subscribe CTA worked based on comments>"
  },
  
  "nextVideoBlueprint": {
    "highestPotentialTopic": {
      "topic": "<the #1 video to make next>",
      "whyThisTopic": "<evidence from comments>",
      "title": "<proposed title>",
      "thumbnail": "<thumbnail concept>",
      "hook": "<word-for-word first 30 seconds>",
      "outline": [
        "<section 1>",
        "<section 2>",
        "..."
      ],
      "mustInclude": ["<things viewers explicitly want>", "..."],
      "mustAvoid": ["<things that annoyed viewers>", "..."],
      "predictedPerformance": "<why this will perform well>"
    },
    "alternativeTopics": [
      {
        "topic": "<another strong video idea>",
        "title": "<proposed title>",
        "hook": "<opening hook>",
        "evidence": "<why this would work>"
      }
    ]
  },
  
  "topRecommendations": [
    {
      "priority": 1,
      "recommendation": "<specific action>",
      "reasoning": "<why this matters>",
      "implementation": "<exactly how to do it>",
      "expectedImpact": "<what will improve>"
    }
  ],
  
  "blindSpots": [
    "<things the creator might not realize about their audience>",
    "..."
  ]
}`;
}

function getTranscriptEnhancedInstructions(): string {
  return `
You have access to BOTH the full transcript AND comments. This is powerful because you can:
1. See exactly what was said and correlate it with viewer reactions
2. Identify which specific moments triggered positive/negative responses
3. Analyze the script structure, pacing, and delivery
4. Find mismatches between promise and delivery
5. Extract the exact language that resonated

ANALYSIS APPROACH:
1. First, read the ENTIRE transcript to understand the video's structure and content
2. Then, map comments to specific transcript sections where possible
3. Look for timestamp mentions in comments (e.g., "at 3:45...")
4. Identify which parts got praise vs criticism
5. Analyze the hook, body, and CTA separately
6. Evaluate pacing by section

Return your analysis in this EXACT JSON structure:

{
  "dataSourcesSummary": {
    "commentsAnalyzed": <number>,
    "transcriptAvailable": true,
    "transcriptDuration": "<X minutes Y seconds>",
    "transcriptWordCount": <number>,
    "wordsPerMinute": <number>,
    "analysisDepth": "full-transcript-correlation"
  },
  
  "audienceProfile": {
    "primaryAvatar": {
      "description": "<detailed description of typical viewer>",
      "skillLevel": "<beginner|intermediate|advanced|mixed>",
      "mainGoal": "<what they're trying to achieve>",
      "currentSituation": "<where they are now>",
      "desiredOutcome": "<where they want to be>",
      "evidenceFromComments": ["<supporting quotes>", "..."]
    },
    "secondaryAvatars": [
      {
        "description": "<other viewer type>",
        "percentage": "<estimated %>",
        "evidence": ["<supporting quotes>"]
      }
    ],
    "surprisingInsight": "<something unexpected about this audience>"
  },
  
  "hookAnalysis": {
    "hookTimestamp": "<0:00 - X:XX>",
    "hookTranscript": "<exact words from first 30-60 seconds>",
    "hookType": "<curiosity|pain-agitation|promise|story|question|statistic|pattern-interrupt|contrast|controversy>",
    "hookStrength": <1-10>,
    "hookAnalysis": {
      "attentionGrab": {
        "score": <1-10>,
        "whatWorked": "<specific element>",
        "whatFailed": "<specific weakness>",
        "viewerReactions": ["<comments about intro>", "..."]
      },
      "clarityOfPromise": {
        "score": <1-10>,
        "promiseMade": "<what the viewer expects to get>",
        "isPromiseClear": <true|false>,
        "viewerExpectations": ["<what viewers thought they'd get>", "..."]
      },
      "curiosityGenerated": {
        "score": <1-10>,
        "openLoops": ["<unanswered questions created>", "..."],
        "tensionBuilt": "<how tension is created>"
      },
      "timeToHook": <seconds until main hook lands>,
      "wastes": ["<unnecessary content before hook>", "..."]
    },
    "improvedHook": {
      "script": "<rewritten hook script - word for word>",
      "whyBetter": "<explanation of improvements>",
      "psychologicalTriggers": ["<triggers used>", "..."]
    }
  },
  
  "scriptStructure": {
    "overallStructure": "<description of how video is organized>",
    "totalSections": <number>,
    "sections": [
      {
        "id": <number>,
        "title": "<descriptive title>",
        "startTime": "<MM:SS>",
        "endTime": "<MM:SS>",
        "duration": "<X min Y sec>",
        "purpose": "<intro|hook|problem|agitation|solution|proof|example|story|cta|tangent|recap>",
        "summary": "<what happens in this section>",
        "keyQuotes": ["<memorable lines from transcript>", "..."],
        "viewerReactions": {
          "positive": ["<positive comments about this section>", "..."],
          "negative": ["<negative comments>", "..."],
          "questions": ["<questions about this section>", "..."]
        },
        "effectiveness": <1-10>,
        "issues": ["<problems with this section>", "..."],
        "improvements": ["<specific fixes>", "..."]
      }
    ],
    "structureScore": <1-10>,
    "structureIssues": [
      {
        "issue": "<structural problem>",
        "location": "<where in video>",
        "impact": "<how it hurts the video>",
        "fix": "<how to fix>"
      }
    ],
    "missingElements": ["<what the video structure lacks>", "..."],
    "unnecessaryElements": ["<what should be cut>", "..."]
  },
  
  "contentDelivery": {
    "pacingAnalysis": {
      "overallPace": "<too-fast|optimal|too-slow|inconsistent>",
      "averageWPM": <number>,
      "pacingIssues": [
        {
          "timestamp": "<MM:SS>",
          "issue": "<rushed|dragged|confusing>",
          "transcript": "<the problematic section>",
          "viewerFeedback": ["<comments about pacing>", "..."],
          "fix": "<how to fix>"
        }
      ]
    },
    "clarityAnalysis": {
      "overallClarity": <1-10>,
      "confusingMoments": [
        {
          "timestamp": "<MM:SS>",
          "transcript": "<confusing part>",
          "whyConfusing": "<explanation>",
          "viewerConfusion": ["<comments showing confusion>", "..."],
          "clearerVersion": "<how to say it more clearly>"
        }
      ],
      "jargonUsed": ["<technical terms that confused viewers>", "..."],
      "assumptionsMade": ["<knowledge assumed that viewers lacked>", "..."]
    },
    "engagementTechniques": {
      "techniquesUsed": ["<pattern interrupts, questions, stories, etc.>", "..."],
      "techniquesEffectiveness": "<how well they worked>",
      "missingTechniques": ["<techniques that should have been used>", "..."],
      "viewerEngagementComments": ["<comments showing engagement/disengagement>", "..."]
    },
    "energyAndTone": {
      "overallEnergy": "<low|medium|high|variable>",
      "toneMatch": "<does tone match content?>",
      "energyDips": [
        {
          "timestamp": "<MM:SS>",
          "issue": "<energy problem>",
          "viewerReactions": ["<relevant comments>", "..."]
        }
      ],
      "recommendations": ["<energy/tone improvements>", "..."]
    }
  },
  
  "contentGaps": {
    "promiseVsDelivery": {
      "titlePromise": "<what title implies>",
      "thumbnailPromise": "<if describable from context>",
      "hookPromise": "<what hook promises>",
      "actualDelivery": "<what was actually delivered>",
      "matchScore": <1-10>,
      "gaps": [
        {
          "promised": "<what was expected>",
          "delivered": "<what was given>",
          "viewerReactions": ["<comments about this gap>", "..."],
          "howToFix": "<fix for future videos>"
        }
      ]
    },
    "missingContent": [
      {
        "topic": "<what viewers expected>",
        "evidence": ["<comments asking for this>", "..."],
        "shouldHaveBeenAt": "<where in video>",
        "howToInclude": "<how to add in future>"
      }
    ],
    "unnecessaryContent": [
      {
        "content": "<what should be cut>",
        "timestamp": "<where>",
        "whyCut": "<reason>",
        "viewerSkipIndicators": ["<comments suggesting they skipped>", "..."]
      }
    ],
    "unexpectedValue": [
      {
        "content": "<bonus content viewers loved>",
        "viewerReactions": ["<positive comments>", "..."],
        "howToExpand": "<could this be its own video?>"
      }
    ]
  },
  
  "engagementPrediction": {
    "retentionCurve": {
      "predictedPattern": "<description of likely retention curve>",
      "strongRetentionMoments": [
        {
          "timestamp": "<MM:SS>",
          "content": "<what's happening>",
          "whyStrong": "<why viewers stay>",
          "evidence": ["<supporting comments>", "..."]
        }
      ],
      "dropOffPoints": [
        {
          "timestamp": "<MM:SS>",
          "content": "<what's happening>",
          "whyDropOff": "<why viewers leave>",
          "severity": "<critical|moderate|minor>",
          "evidence": ["<supporting comments>", "..."],
          "fix": "<how to prevent>"
        }
      ]
    },
    "replayMoments": [
      {
        "timestamp": "<MM:SS>",
        "content": "<what's happening>",
        "whyReplay": "<why viewers come back to this>",
        "evidence": ["<comments mentioning this part>", "..."]
      }
    ],
    "ctaEffectiveness": {
      "ctaTimestamp": "<MM:SS>",
      "ctaTranscript": "<exact CTA words>",
      "ctaType": "<subscribe|like|comment|other>",
      "effectiveness": <1-10>,
      "viewerResponse": ["<comments indicating they took action>", "..."],
      "improvedCTA": "<better CTA script>"
    }
  },
  
  "sentiment": {
    "overall": "<positive|negative|mixed|neutral>",
    "score": <-1.0 to 1.0>,
    "distribution": {
      "positive": <0-100>,
      "negative": <0-100>,
      "neutral": <0-100>
    },
    "emotionalJourney": [
      {
        "timestamp": "<MM:SS>",
        "emotion": "<dominant emotion>",
        "trigger": "<what caused it>",
        "evidence": ["<comments>", "..."]
      }
    ],
    "positiveDrivers": [
      {
        "driver": "<what viewers loved>",
        "transcriptReference": "<MM:SS - exact quote from video>",
        "frequency": <count>,
        "sampleComments": ["<exact quotes>", "..."]
      }
    ],
    "negativeDrivers": [
      {
        "driver": "<what viewers disliked>",
        "transcriptReference": "<MM:SS - exact quote from video>",
        "frequency": <count>,
        "sampleComments": ["<exact quotes>", "..."],
        "howToFix": "<specific fix>"
      }
    ]
  },
  
  "painPoints": [
    {
      "pain": "<specific problem viewers have>",
      "intensity": "<severe|moderate|mild>",
      "frequency": <count>,
      "sampleComments": ["<exact quotes>", "..."],
      "addressedInVideo": {
        "wasAddressed": <true|false>,
        "timestamp": "<MM:SS if addressed>",
        "howWellAddressed": <1-10>,
        "whatWasSaid": "<transcript quote>",
        "viewerSatisfaction": "<were they satisfied?>"
      },
      "contentOpportunity": {
        "title": "<video idea>",
        "hook": "<opening>",
        "angle": "<unique angle>"
      }
    }
  ],
  
  "audienceDesires": [
    {
      "desire": "<what they want>",
      "urgency": "<desperate|strong|moderate|casual>",
      "frequency": <count>,
      "sampleComments": ["<exact quotes>", "..."],
      "addressedInVideo": {
        "wasAddressed": <true|false>,
        "timestamp": "<MM:SS if addressed>",
        "howWellAddressed": <1-10>
      },
      "contentOpportunity": {
        "title": "<video idea>",
        "hook": "<opening>",
        "angle": "<unique angle>"
      }
    }
  ],
  
  "objections": [
    {
      "objection": "<skepticism or resistance>",
      "frequency": <count>,
      "validity": "<valid|partially-valid|misconception>",
      "sampleComments": ["<exact quotes>", "..."],
      "addressedInVideo": {
        "wasAddressed": <true|false>,
        "timestamp": "<MM:SS if addressed>",
        "whatWasSaid": "<transcript quote>",
        "effectiveness": <1-10>
      },
      "betterResponse": "<what to say to address this>"
    }
  ],
  
  "knowledgeGaps": [
    {
      "topic": "<what viewers don't understand>",
      "frequency": <count>,
      "sampleQuestions": ["<exact questions>", "..."],
      "relatedTranscriptMoment": {
        "timestamp": "<MM:SS>",
        "whatWasSaid": "<transcript quote>",
        "whyConfusing": "<why this confused them>"
      },
      "videoIdea": {
        "title": "<proposed title>",
        "hook": "<opening>",
        "keyPoints": ["<points to cover>", "..."]
      }
    }
  ],
  
  "demandSignals": [
    {
      "request": "<what viewers asked for>",
      "frequency": <count>,
      "urgency": "<high|medium|low>",
      "sampleComments": ["<exact quotes>", "..."],
      "relatedToVideoMoment": "<which part triggered this request>",
      "videoIdea": {
        "title": "<proposed title>",
        "hook": "<opening>",
        "angle": "<unique angle>",
        "differentiator": "<what makes it unique>"
      }
    }
  ],
  
  "quotableLines": [
    {
      "timestamp": "<MM:SS>",
      "quote": "<exact transcript line>",
      "whyQuotable": "<why this resonated>",
      "viewerReactions": ["<comments quoting or referencing this>", "..."],
      "howToReplicate": "<how to create more lines like this>"
    }
  ],
  
  "resonance": {
    "whatWorked": [
      {
        "element": "<specific thing that worked>",
        "timestamp": "<MM:SS>",
        "transcript": "<exact words>",
        "whyItWorked": "<psychological reason>",
        "evidence": ["<supporting comments>", "..."],
        "howToReplicate": "<do this again by...>"
      }
    ],
    "whatFlopped": [
      {
        "element": "<what didn't work>",
        "timestamp": "<MM:SS>",
        "transcript": "<exact words>",
        "whyItFailed": "<psychological reason>",
        "evidence": ["<supporting comments>", "..."],
        "howToFix": "<fix by...>"
      }
    ]
  },
  
  "nextVideoBlueprint": {
    "highestPotentialTopic": {
      "topic": "<the #1 video to make next based on all data>",
      "whyThisTopic": "<evidence from comments AND transcript analysis>",
      "title": "<proposed title>",
      "thumbnailConcept": "<thumbnail idea>",
      "hook": {
        "type": "<hook type to use>",
        "script": "<word-for-word first 60 seconds>",
        "psychologicalTriggers": ["<triggers>", "..."]
      },
      "outline": [
        {
          "section": "<section name>",
          "duration": "<suggested length>",
          "content": "<what to cover>",
          "technique": "<engagement technique to use>"
        }
      ],
      "mustInclude": ["<from viewer feedback>", "..."],
      "mustAvoid": ["<from negative feedback>", "..."],
      "callToAction": "<CTA script>",
      "predictedPerformance": "<why this will outperform>"
    },
    "alternativeTopics": [
      {
        "topic": "<video idea>",
        "title": "<proposed title>",
        "hook": "<opening>",
        "evidence": "<why this would work>"
      }
    ]
  },
  
  "scriptImprovements": {
    "overallScore": <1-10>,
    "topIssues": [
      {
        "issue": "<specific problem>",
        "timestamp": "<where>",
        "currentScript": "<what was said>",
        "improvedScript": "<what to say instead>",
        "expectedImpact": "<how this helps>"
      }
    ],
    "structureRecommendation": "<how to restructure future videos>",
    "lengthRecommendation": {
      "currentLength": "<current duration>",
      "optimalLength": "<suggested duration>",
      "reasoning": "<based on engagement signals>"
    }
  },
  
  "topRecommendations": [
    {
      "priority": 1,
      "category": "<hook|structure|content|delivery|cta>",
      "recommendation": "<specific action>",
      "reasoning": "<evidence-based reasoning>",
      "implementation": "<exactly how to do it>",
      "exampleScript": "<if applicable, exact words to use>",
      "expectedImpact": "<what will improve>"
    }
  ],
  
  "blindSpots": [
    "<things the creator might not realize>",
    "..."
  ]
}

REMEMBER:
- Include SPECIFIC timestamps and transcript quotes as evidence
- Every recommendation needs EXACT implementation details
- Content ideas need WORD-FOR-WORD hooks, not just topics
- Be specific about what to SAY, not just what to "consider"`;
}

export function buildQuickInsightsPrompt(data: ScrapedData): string {
  const comments = data.comments.slice(0, 500).map(c => c.text).join('\n');
  
  return `Analyze these ${data.comments.length} YouTube comments and give me a quick summary:

VIDEO: ${data.videoTitle}

COMMENTS:
${comments}

Respond in JSON:
{
  "topThemes": ["<theme 1>", "<theme 2>", "<theme 3>"],
  "sentimentSummary": "<1 sentence overall sentiment>",
  "topPraise": "<most common praise>",
  "topCriticism": "<most common criticism>",
  "topQuestion": "<most common question>",
  "viralPotential": "<1-10 score with reason>"
}`;
}

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

export function buildDeepAnalysisPrompt(data: ScrapedData): string {
  const hasTranscript = data.transcript && data.transcript.fullText.length > 0;
  
  // Format comments
  const formattedComments = data.comments
    .slice(0, 2000)
    .map((c, i) => `[Comment ${i + 1}] (${c.likes} likes) ${c.text}`)
    .join('\n');
  
  // Format transcript if available
  const transcriptSection = hasTranscript 
    ? `
## VIDEO TRANSCRIPT (with timestamps)
Duration: ${Math.floor(data.transcript!.totalDuration / 60000)} minutes
Word Count: ~${data.transcript!.fullText.split(/\s+/).length} words

${formatTranscriptWithTimestamps(data.transcript!)}
`
    : '';

  const basePrompt = `You are an expert YouTube content analyst specializing in audience psychology, content strategy, and creator growth. Analyze this YouTube video data to extract actionable insights.

## VIDEO METADATA
- Title: ${data.videoTitle}
- Channel: ${data.channelName}
- Views: ${data.viewCount.toLocaleString()}
- Likes: ${data.likeCount.toLocaleString()}
- Comments: ${data.commentCount.toLocaleString()}
- Published: ${data.publishedAt}
- Duration: ${data.duration}

## VIDEO DESCRIPTION
${data.videoDescription?.slice(0, 2000) || 'No description available'}
${transcriptSection}
## COMMENTS (${data.comments.length} total, sorted by engagement)
${formattedComments}

---

ANALYSIS INSTRUCTIONS:

${hasTranscript ? getTranscriptEnhancedInstructions() : getCommentOnlyInstructions()}

CRITICAL: Your response must be valid JSON matching this exact structure. Do not include any text outside the JSON object.`;

  return basePrompt;
}

function getCommentOnlyInstructions(): string {
  return `Analyze the comments and provide insights in this JSON format:

{
  "dataSourcesSummary": {
    "commentsAnalyzed": <number>,
    "transcriptAvailable": false
  },
  "sentiment": {
    "overall": "<positive|negative|mixed|neutral>",
    "score": <-1 to 1>,
    "distribution": {
      "positive": <percentage 0-100>,
      "negative": <percentage 0-100>,
      "neutral": <percentage 0-100>
    },
    "positiveDrivers": ["<what viewers loved>", ...],
    "negativeDrivers": ["<what viewers disliked>", ...]
  },
  "knowledgeGaps": [
    {
      "topic": "<topic viewers don't understand>",
      "questionCount": <estimated count>,
      "sampleQuestions": ["<actual questions from comments>", ...],
      "suggestedContent": "<content idea to address this>"
    }
  ],
  "demandSignals": [
    {
      "request": "<what viewers are asking for>",
      "frequency": <estimated mentions>,
      "urgency": "<high|medium|low>",
      "sampleComments": ["<actual comments>", ...],
      "businessPotential": "<how to monetize this demand>"
    }
  ],
  "myths": [
    {
      "myth": "<false belief expressed>",
      "prevalence": <estimated count>,
      "correction": "<the accurate information>",
      "sampleComments": ["<comments expressing this myth>", ...]
    }
  ],
  "painPoints": [
    {
      "problem": "<problem viewers face>",
      "intensity": "<severe|moderate|mild>",
      "frequency": <estimated count>,
      "sampleComments": ["<comments about this pain>", ...],
      "potentialSolution": "<how to help them>"
    }
  ],
  "resonance": {
    "whatWorked": [
      {
        "aspect": "<what resonated>",
        "evidence": ["<supporting comments>", ...],
        "sentiment": "positive"
      }
    ],
    "whatFlopped": [
      {
        "aspect": "<what didn't work>",
        "evidence": ["<supporting comments>", ...],
        "sentiment": "negative"
      }
    ]
  },
  "topRecommendations": [
    "<actionable recommendation 1>",
    "<actionable recommendation 2>",
    "<actionable recommendation 3>",
    "<actionable recommendation 4>",
    "<actionable recommendation 5>"
  ],
  "contentIdeas": [
    "<video idea based on audience demand>",
    "<video idea based on knowledge gaps>",
    "<video idea based on pain points>"
  ]
}`;
}

function getTranscriptEnhancedInstructions(): string {
  return `Perform a DEEP ANALYSIS by correlating the video transcript with viewer comments. This is powerful because you can now see WHAT was said and HOW viewers reacted to specific parts.

Provide insights in this JSON format:

{
  "dataSourcesSummary": {
    "commentsAnalyzed": <number>,
    "transcriptAvailable": true,
    "transcriptDuration": "<X minutes>",
    "transcriptWordCount": <number>
  },
  "sentiment": {
    "overall": "<positive|negative|mixed|neutral>",
    "score": <-1 to 1>,
    "distribution": {
      "positive": <percentage 0-100>,
      "negative": <percentage 0-100>,
      "neutral": <percentage 0-100>
    },
    "positiveDrivers": ["<what viewers loved>", ...],
    "negativeDrivers": ["<what viewers disliked>", ...]
  },
  "hookAnalysis": {
    "hookType": "<curiosity|pain-point|promise|story|question|statistic|contrast>",
    "hookText": "<exact text of the hook from transcript (first 30-60 seconds)>",
    "effectiveness": "<strong|moderate|weak>",
    "clarityScore": <1-10>,
    "timeToHook": <seconds until main hook is delivered>,
    "commentFeedback": ["<comments specifically about the intro/hook>", ...],
    "improvements": ["<specific improvement suggestions>", ...]
  },
  "scriptStructure": {
    "totalSections": <number>,
    "sections": [
      {
        "id": 1,
        "title": "<descriptive title for this section>",
        "startTime": "<MM:SS>",
        "endTime": "<MM:SS>",
        "duration": <seconds>,
        "content": "<brief summary of what's covered>",
        "purpose": "<introduction|problem|solution|example|cta|tangent|etc>",
        "relatedComments": [
          {
            "text": "<comment that relates to this section>",
            "sentiment": "<positive|negative|neutral>",
            "mentionsTimestamp": <true|false>,
            "timestamp": "<if mentioned>"
          }
        ],
        "sentimentInSection": "<positive|negative|neutral|mixed>"
      }
    ],
    "flowScore": <1-10 how well sections connect>,
    "transitionQuality": "<smooth|adequate|choppy>",
    "logicalGaps": ["<missing transitions or jumps in logic>", ...],
    "redundancies": ["<repeated content that could be cut>", ...]
  },
  "contentGaps": {
    "promisedContent": ["<what the title/intro promised>", ...],
    "deliveredContent": ["<what was actually covered>", ...],
    "missingPieces": [
      {
        "topic": "<what viewers expected but didn't get>",
        "viewerExpectation": "<why they expected this>",
        "actualCoverage": "<what the video actually covered instead>",
        "viewerFeedback": ["<comments asking about this>", ...],
        "recommendation": "<how to address in future content>"
      }
    ],
    "unexpectedBonuses": ["<valuable content that exceeded expectations>", ...]
  },
  "pacingAnalysis": {
    "overallPace": "<too-fast|optimal|too-slow|inconsistent>",
    "averageWordsPerMinute": <number>,
    "fastSections": [
      {
        "timestamp": "<MM:SS>",
        "description": "<what was rushed>",
        "wordsPerMinute": <number>
      }
    ],
    "slowSections": [
      {
        "timestamp": "<MM:SS>",
        "description": "<what dragged>",
        "wordsPerMinute": <number>
      }
    ],
    "commentFeedback": ["<comments about pacing/speed>", ...]
  },
  "engagementPrediction": {
    "predictedDropOffPoints": [
      {
        "timestamp": "<MM:SS>",
        "reason": "<why viewers might leave>",
        "severity": "<high|medium|low>",
        "fix": "<specific fix>"
      }
    ],
    "highEngagementMoments": [
      {
        "timestamp": "<MM:SS>",
        "reason": "<why this moment is engaging>",
        "commentEvidence": ["<comments praising this part>", ...]
      }
    ],
    "retentionTips": ["<specific tips to improve retention>", ...]
  },
  "knowledgeGaps": [
    {
      "topic": "<topic viewers don't understand>",
      "questionCount": <estimated count>,
      "sampleQuestions": ["<actual questions from comments>", ...],
      "suggestedContent": "<content idea to address this>",
      "relatedTranscriptSection": "<timestamp where this was/should have been covered>"
    }
  ],
  "demandSignals": [
    {
      "request": "<what viewers are asking for>",
      "frequency": <estimated mentions>,
      "urgency": "<high|medium|low>",
      "sampleComments": ["<actual comments>", ...],
      "businessPotential": "<how to monetize this demand>"
    }
  ],
  "myths": [
    {
      "myth": "<false belief expressed in comments>",
      "prevalence": <estimated count>,
      "correction": "<the accurate information>",
      "sampleComments": ["<comments expressing this myth>", ...],
      "transcriptReference": "<where video addressed/should address this>"
    }
  ],
  "painPoints": [
    {
      "problem": "<problem viewers face>",
      "intensity": "<severe|moderate|mild>",
      "frequency": <estimated count>,
      "sampleComments": ["<comments about this pain>", ...],
      "potentialSolution": "<how to help them>"
    }
  ],
  "resonance": {
    "whatWorked": [
      {
        "aspect": "<what resonated>",
        "evidence": ["<supporting comments>", ...],
        "sentiment": "positive",
        "transcriptTimestamp": "<timestamp of this content>"
      }
    ],
    "whatFlopped": [
      {
        "aspect": "<what didn't work>",
        "evidence": ["<supporting comments>", ...],
        "sentiment": "negative",
        "transcriptTimestamp": "<timestamp of this content>"
      }
    ]
  },
  "topRecommendations": [
    "<actionable recommendation based on transcript+comment analysis>",
    "<specific improvement with timestamp reference>",
    "<content structure recommendation>",
    "<pacing/delivery recommendation>",
    "<follow-up content recommendation>"
  ],
  "contentIdeas": [
    "<video idea addressing top knowledge gap>",
    "<video idea based on strongest demand signal>",
    "<video idea expanding on most resonant section>",
    "<video idea fixing biggest content gap>"
  ]
}

IMPORTANT ANALYSIS GUIDELINES:
1. CORRELATE comments with transcript sections - find which parts viewers loved/hated
2. Look for timestamp mentions in comments (like "3:45 was great") and match to transcript
3. Identify SPECIFIC quotes from the transcript that caused reactions
4. Be precise with timestamps - viewers can use these to navigate
5. Focus on ACTIONABLE insights the creator can implement
6. When analyzing hook/intro, look at first 30-60 seconds of transcript
7. For pacing, estimate words per minute in different sections
8. For content gaps, compare what was promised (title/intro) vs delivered (full transcript)`;
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

import { NextRequest, NextResponse } from 'next/server';
import { buildDeepAnalysisPrompt } from '@/lib/prompts';
import { ScrapedData, AIModel } from '@/lib/types';

export const maxDuration = 300; // 5 minutes for LLM analysis

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

// Model-specific configurations for optimal output
// CRITICAL: Max tokens MUST be high enough for comprehensive analysis (10K-20K words)
const MODEL_CONFIGS: Record<string, { maxTokens: number; temperature: number }> = {
  // Free models - push to limits for detailed responses
  'x-ai/grok-4.1-fast:free': { maxTokens: 131072, temperature: 0.5 },  // 128K max, request high for detail
  'openai/gpt-oss-20b:free': { maxTokens: 32000, temperature: 0.5 },
  'z-ai/glm-4.5-air:free': { maxTokens: 32000, temperature: 0.5 },

  // Google models - MASSIVE context, use it
  'google/gemini-3-pro-preview': { maxTokens: 100000, temperature: 0.5 },
  'google/gemini-2.5-pro-preview-06-05': { maxTokens: 100000, temperature: 0.5 },
  'google/gemini-2.5-flash-preview-05-20': { maxTokens: 65000, temperature: 0.5 },

  // OpenAI models - increased for comprehensive output
  'openai/gpt-5.1': { maxTokens: 32000, temperature: 0.6 },
  'openai/gpt-4o-mini': { maxTokens: 32000, temperature: 0.6 },
  'openai/gpt-4o': { maxTokens: 32000, temperature: 0.6 },
  'openai/gpt-oss-120b:exacto': { maxTokens: 32000, temperature: 0.5 },

  // Anthropic Claude models - known for following instructions well
  'anthropic/claude-haiku-4.5': { maxTokens: 16384, temperature: 0.6 },
  'anthropic/claude-opus-4.5': { maxTokens: 32000, temperature: 0.6 },
  'anthropic/claude-sonnet-4.5': { maxTokens: 32000, temperature: 0.6 },
  'anthropic/claude-sonnet-4': { maxTokens: 32000, temperature: 0.6 },

  // xAI Grok models - increase for better output
  'x-ai/grok-4': { maxTokens: 65000, temperature: 0.5 },
  'x-ai/grok-3-mini': { maxTokens: 32000, temperature: 0.5 },
  'x-ai/grok-4-fast': { maxTokens: 65000, temperature: 0.5 },

  // Zhipu AI models
  'z-ai/glm-4.6': { maxTokens: 32000, temperature: 0.5 },
  'z-ai/glm-4.5': { maxTokens: 32000, temperature: 0.5 },

  'default': { maxTokens: 32000, temperature: 0.5 }
};

async function callOpenRouter(
  messages: OpenRouterMessage[],
  model: AIModel
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const config = MODEL_CONFIGS[model] || MODEL_CONFIGS['default'];

  // Some models struggle with strict JSON formatting - only use it for models that support it well
  const supportsJsonMode = model.includes('gemini') || model.includes('gpt-4') || model.includes('claude');

  const requestBody: Record<string, unknown> = {
    model,
    messages,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    // Add provider-specific settings for better quality
    provider: {
      order: ['Google', 'Anthropic', 'OpenAI'],
      allow_fallbacks: true
    }
  };

  // Only add response_format for models that handle it well
  if (supportsJsonMode) {
    requestBody.response_format = { type: 'json_object' };
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://youtube-deep-analyzer.vercel.app',
      'X-Title': 'YouTube Deep Analyzer'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter error:', errorText);
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data: OpenRouterResponse = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.choices[0]?.message?.content || '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseAnalysisResponse(content: string): any {
  // Try to extract JSON from the response
  let jsonContent = content;

  console.log('Raw response length:', content.length);
  console.log('First 500 chars:', content.slice(0, 500));
  console.log('Last 500 chars:', content.slice(-500));

  // Handle markdown code blocks
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    console.log('Found JSON in markdown code block');
    jsonContent = jsonMatch[1];
  }

  // Sometimes models add text before/after - try to find the JSON object
  const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch && jsonObjectMatch) {
    console.log('Extracting JSON object from text');
    jsonContent = jsonObjectMatch[0];
  }

  // Clean up any leading/trailing whitespace
  jsonContent = jsonContent.trim();

  // Remove any BOM or invisible characters
  jsonContent = jsonContent.replace(/^\uFEFF/, '');

  // Check if response was truncated
  if (!jsonContent.endsWith('}') && !jsonContent.endsWith(']')) {
    console.warn('Response appears truncated - trying to fix');
    // Try to close any open braces/brackets
    const openBraces = (jsonContent.match(/\{/g) || []).length;
    const closeBraces = (jsonContent.match(/\}/g) || []).length;
    const openBrackets = (jsonContent.match(/\[/g) || []).length;
    const closeBrackets = (jsonContent.match(/\]/g) || []).length;

    // Add missing closing brackets/braces
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      jsonContent += ']';
    }
    for (let i = 0; i < openBraces - closeBraces; i++) {
      jsonContent += '}';
    }
  }

  try {
    return JSON.parse(jsonContent);
  } catch (e) {
    console.error('JSON parse error:', e);
    console.error('Content preview:', jsonContent.slice(0, 1000));
    console.error('Content end:', jsonContent.slice(-500));

    // Try to fix common JSON issues
    try {
      // Remove trailing commas
      let fixed = jsonContent
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        // Fix unescaped quotes in strings
        .replace(/\\'/g, "'")
        // Remove comments if any
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*/g, '');

      return JSON.parse(fixed);
    } catch (e2) {
      console.error('Second parse attempt failed:', e2);
      throw new Error('Failed to parse AI response as JSON. The model may have generated incomplete output. Response length: ' + content.length);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      data,
      model = 'google/gemini-2.5-pro-preview'
    }: {
      data: ScrapedData;
      model?: AIModel;
    } = await request.json();

    if (!data || !data.comments || data.comments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No data provided for analysis' },
        { status: 400 }
      );
    }

    console.log(`Starting analysis with ${model}`);
    console.log(`Data: ${data.comments.length} comments, transcript: ${data.transcript ? 'yes' : 'no'}`);

    const prompt = buildDeepAnalysisPrompt(data);

    console.log(`Prompt length: ${prompt.length} characters (~${Math.round(prompt.length / 4)} tokens)`);

    // Use system message for better instruction following
    const systemMessage = `You are an expert YouTube content strategist and data analyst. Your task is to provide deep, actionable analysis of YouTube videos based on their comments and transcripts.

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY valid JSON - start with { and end with }
2. Be SPECIFIC - use exact quotes, timestamps, and numbers
3. Be ACTIONABLE - every insight must tell the creator exactly what to do
4. Be THOROUGH but CONCISE - fill out ALL required fields but keep each item focused
5. Be HONEST - if something didn't work, say it clearly with evidence

IMPORTANT: Your response will be cut off if too long, so prioritize:
- Quality over quantity
- 3-5 high-quality items per array (not 10+)
- Keep sampleComments to 1-3 per item (not 5+)
- Keep descriptions under 200 chars each

MINIMUM REQUIREMENTS (keep concise):
   - painPoints: 3-5 items, 1-2 sampleComments each
   - audienceDesires: 2-3 items
   - knowledgeGaps: 2-3 items, 1-2 sampleQuestions each
   - demandSignals: 2-3 items
   - sentiment.positiveDrivers: 2-3 items, 1-2 sampleComments each
   - sentiment.negativeDrivers: 1-2 items, 1-2 sampleComments each
   - resonance.whatWorked: 2-3 items with evidence
   - resonance.whatFlopped: 1-2 items with evidence
   - topRecommendations: 3-5 specific actionable items
   - If transcript: hookAnalysis, scriptStructure with 3-5 sections, contentGaps

CRITICAL: Ensure JSON is COMPLETE and VALID. If running out of tokens, close all arrays/objects properly. DO NOT truncate mid-field.`;

    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: systemMessage
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const responseContent = await callOpenRouter(messages, model);

    console.log(`Response length: ${responseContent.length} characters`);

    let analysisData;
    try {
      analysisData = parseAnalysisResponse(responseContent);
    } catch (parseError) {
      console.error('Failed to parse response, returning minimal analysis:', parseError);
      // Return a minimal valid analysis if parsing completely fails
      analysisData = {
        sentiment: {
          overall: 'mixed',
          score: 0,
          distribution: { positive: 50, negative: 25, neutral: 25 },
          positiveDrivers: [],
          negativeDrivers: []
        },
        resonance: {
          whatWorked: [],
          whatFlopped: []
        },
        painPoints: [],
        knowledgeGaps: [],
        demandSignals: [],
        topRecommendations: ['Unable to parse AI response - try using a different model like Gemini 2.5 Pro or Claude Sonnet 4.5'],
        contentIdeas: [],
        myths: []
      };
    }

    // Return the full analysis data - the frontend will handle display
    // This preserves all the rich fields the model generates
    const result = {
      videoId: data.videoId,
      videoTitle: data.videoTitle,
      channelName: data.channelName,
      analyzedAt: new Date().toISOString(),
      model: model,

      // Metadata
      dataSourcesSummary: analysisData.dataSourcesSummary || {
        commentsAnalyzed: data.comments.length,
        transcriptAvailable: !!data.transcript,
        transcriptDuration: data.transcript
          ? `${Math.floor(data.transcript.totalDuration / 60000)} minutes`
          : undefined,
        transcriptWordCount: data.transcript
          ? data.transcript.fullText.split(/\s+/).length
          : undefined
      },

      // Core analysis fields - preserve whatever the model returns
      audienceProfile: analysisData.audienceProfile,
      sentiment: analysisData.sentiment,
      hookAnalysis: analysisData.hookAnalysis,
      scriptStructure: analysisData.scriptStructure,
      contentDelivery: analysisData.contentDelivery,
      contentGaps: analysisData.contentGaps,
      engagementPrediction: analysisData.engagementPrediction,

      // Audience insights
      painPoints: analysisData.painPoints || [],
      audienceDesires: analysisData.audienceDesires || [],
      objections: analysisData.objections || [],
      knowledgeGaps: analysisData.knowledgeGaps || [],
      demandSignals: analysisData.demandSignals || [],

      // Content insights
      quotableLines: analysisData.quotableLines || [],
      resonance: analysisData.resonance,
      viralElements: analysisData.viralElements,
      competitorMentions: analysisData.competitorMentions || [],
      subscriberConversion: analysisData.subscriberConversion,

      // Actionable outputs
      nextVideoBlueprint: analysisData.nextVideoBlueprint,
      scriptImprovements: analysisData.scriptImprovements,
      topRecommendations: analysisData.topRecommendations || [],
      blindSpots: analysisData.blindSpots || [],

      // Legacy fields for backward compatibility
      myths: analysisData.myths || [],
      contentIdeas: analysisData.contentIdeas || analysisData.nextVideoBlueprint?.alternativeTopics?.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (t: any) => t.title
      ) || [],
      pacingAnalysis: analysisData.contentDelivery?.pacingAnalysis || analysisData.pacingAnalysis
    };

    console.log('Analysis complete - fields populated:', Object.keys(result).filter(k => result[k as keyof typeof result] != null).length);

    return NextResponse.json({
      success: true,
      analysis: result
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}

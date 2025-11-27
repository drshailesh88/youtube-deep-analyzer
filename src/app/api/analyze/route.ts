import { NextRequest, NextResponse } from 'next/server';
import { buildDeepAnalysisPrompt } from '@/lib/prompts';
import { ScrapedData, DeepAnalysisResult, AIModel } from '@/lib/types';

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

async function callOpenRouter(
  messages: OpenRouterMessage[],
  model: AIModel
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://youtube-deep-analyzer.vercel.app',
      'X-Title': 'YouTube Deep Analyzer'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 16000,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })
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

function parseAnalysisResponse(content: string): Partial<DeepAnalysisResult> {
  // Try to extract JSON from the response
  let jsonContent = content;
  
  // Handle markdown code blocks
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonContent = jsonMatch[1];
  }
  
  // Clean up any leading/trailing whitespace
  jsonContent = jsonContent.trim();
  
  try {
    return JSON.parse(jsonContent);
  } catch (e) {
    console.error('JSON parse error:', e);
    console.error('Content:', jsonContent.slice(0, 500));
    throw new Error('Failed to parse AI response as JSON');
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
    
    console.log(`Prompt length: ${prompt.length} characters`);

    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: prompt
      }
    ];

    const responseContent = await callOpenRouter(messages, model);
    const analysisData = parseAnalysisResponse(responseContent);

    // Build the complete result
    const result: DeepAnalysisResult = {
      videoId: data.videoId,
      videoTitle: data.videoTitle,
      analyzedAt: new Date().toISOString(),
      
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
      
      sentiment: analysisData.sentiment || {
        overall: 'neutral',
        score: 0,
        distribution: { positive: 33, negative: 33, neutral: 34 },
        positiveDrivers: [],
        negativeDrivers: []
      },
      
      knowledgeGaps: analysisData.knowledgeGaps || [],
      demandSignals: analysisData.demandSignals || [],
      myths: analysisData.myths || [],
      painPoints: analysisData.painPoints || [],
      
      resonance: analysisData.resonance || {
        whatWorked: [],
        whatFlopped: []
      },
      
      // Transcript-enhanced fields (may be undefined if no transcript)
      hookAnalysis: analysisData.hookAnalysis,
      scriptStructure: analysisData.scriptStructure,
      contentGaps: analysisData.contentGaps,
      pacingAnalysis: analysisData.pacingAnalysis,
      engagementPrediction: analysisData.engagementPrediction,
      
      topRecommendations: analysisData.topRecommendations || [],
      contentIdeas: analysisData.contentIdeas || []
    };

    console.log('Analysis complete');

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

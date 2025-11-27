// Utility functions for the YouTube Deep Analyzer

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatDuration(isoDuration: string): string {
  // Parse ISO 8601 duration (PT1H2M3S)
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return isoDuration;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function formatTimestampFromMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function getSentimentColor(sentiment: string): string {
  const colors: Record<string, string> = {
    positive: '#22c55e',
    negative: '#ef4444',
    neutral: '#6b7280',
    mixed: '#f59e0b'
  };
  return colors[sentiment] || colors.neutral;
}

export function getSentimentEmoji(sentiment: string): string {
  const emojis: Record<string, string> = {
    positive: '😊',
    negative: '😞',
    neutral: '😐',
    mixed: '🤔'
  };
  return emojis[sentiment] || emojis.neutral;
}

export function getIntensityColor(intensity: string): string {
  const colors: Record<string, string> = {
    severe: '#dc2626',
    high: '#f97316',
    moderate: '#eab308',
    medium: '#eab308',
    mild: '#22c55e',
    low: '#22c55e'
  };
  return colors[intensity] || '#6b7280';
}

export function calculateEngagementRate(views: number, likes: number, comments: number): number {
  if (views === 0) return 0;
  return ((likes + comments) / views) * 100;
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Color palette for charts
export const CHART_COLORS = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#94a3b8',
  primary: '#0ea5e9',
  secondary: '#8b5cf6',
  accent: '#f59e0b',
  muted: '#64748b'
};

// Gradient definitions for charts
export const GRADIENTS = {
  positive: ['#22c55e', '#16a34a'],
  negative: ['#ef4444', '#dc2626'],
  primary: ['#0ea5e9', '#0284c7'],
  purple: ['#8b5cf6', '#7c3aed']
};

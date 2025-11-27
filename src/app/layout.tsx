import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YouTube Deep Analyzer | AI-Powered Video Analysis',
  description: 'Analyze YouTube videos with AI. Get insights from comments AND transcript correlation for deeper understanding of your audience.',
  keywords: 'YouTube, video analysis, AI, comments, transcript, audience insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="animated-bg" />
        {children}
      </body>
    </html>
  );
}

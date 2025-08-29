import './global.css';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: {
    template: '%s | Mini Perplexity',
    default: 'Mini Perplexity - AI Search Assistant',
  },
  description: 'AI-powered search and summarization tool built with Next.js',
  metadataBase: new URL('https://your-domain.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: {
    template: '%s | katabolab blog',
    default: 'katabolab blog',
  },
  description: 'Thoughts, technical essays, and logs from katabolab.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://blog.katabolab.com'),
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen selection:bg-neutral-200 dark:selection:bg-neutral-800 antialiased flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

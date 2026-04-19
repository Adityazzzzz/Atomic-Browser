import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: 'VibeBrowser',
  description: 'A Next.js Remote Browser',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="vibe-telemetry" strategy="beforeInteractive">
          {`
          if (typeof window !== 'undefined' && window.parent !== window) {
            try {
              const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                  if (entry.initiatorType !== 'fetch' && entry.initiatorType !== 'xmlhttprequest') {
                    window.parent.postMessage({
                      type: 'VIBE_NETWORK_LOG',
                      payload: { 
                        url: entry.name, 
                        method: 'GET', 
                        status: 200,
                        latencyMs: Math.round(entry.duration),
                        type: entry.initiatorType ? entry.initiatorType.toUpperCase() : 'DOC'
                      }
                    }, '*');
                  }
                });
              });
              observer.observe({ entryTypes: ['resource', 'navigation'] });
            } catch (e) {}
          }
          `}
        </Script>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

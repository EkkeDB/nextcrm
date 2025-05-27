// File: src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: ['CRM', 'Contract Management', 'Business', 'GDPR'],
  authors: [{ name: 'NextCRM Team' }],
  creator: 'NextCRM',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: false, // Don't index in development
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Viewport for responsive design */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {/* Main App Wrapper */}
        <div id="app-root" className="min-h-screen bg-background">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
        
        {/* Portal container for modals, tooltips, etc. */}
        <div id="portal-root" />
        
        {/* Development tools */}
        {process.env.NODE_ENV === 'development' && (
          <div id="dev-tools" />
        )}
      </body>
    </html>
  );
}
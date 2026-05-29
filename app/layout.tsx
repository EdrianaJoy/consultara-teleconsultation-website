/**
 * ConsulTara TeleConsultation Platform - Root Layout
 * 
 * This layout provides the base HTML structure and wraps the application
 * with necessary providers for authentication and data management.
 */

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/auth-context';
import { AppDataProvider } from '@/lib/app-data-context';
import './globals.css';

const geist = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'ConsulTara - TeleConsultation Platform',
  description: 'Connect with healthcare professionals from the comfort of your home. Book appointments, consult online, and manage your health records securely.',
  keywords: ['telemedicine', 'teleconsultation', 'online doctor', 'healthcare', 'medical consultation'],
  authors: [{ name: 'ConsulTara Team' }],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#769382',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} bg-background`} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen" suppressHydrationWarning>
        <AuthProvider>
          <AppDataProvider>
            {children}
            <Toaster 
              position="top-right" 
              richColors 
              toastOptions={{
                style: {
                  background: '#FFFFFF',
                  border: '1px solid #C0C3B9',
                },
              }}
            />
          </AppDataProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from './AuthProvider';
import { SessionProvider } from './SessionProvider';

export const metadata: Metadata = {
  title: 'LISN',
  description: 'Record, Transcribe, and Summarize your audio with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <SessionProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
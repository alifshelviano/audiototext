import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "./providers/AuthProvider";
import { SessionProvider } from "./providers/SessionProvider";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "LISN",
  description: "Record, Transcribe, and Summarize your audio with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
          rel="stylesheet"
        />
      </head>

      {/* 
        - `transition-colors` untuk animasi halus ketika ganti tema
        - `min-h-screen` supaya background full
      */}
      <body className="font-body antialiased transition-colors duration-300 min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <SessionProvider>
          <AuthProvider>
            {/* 🌓 ThemeProvider global */}
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={true}
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

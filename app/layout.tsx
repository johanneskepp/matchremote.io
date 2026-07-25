import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "matchremote - Find Your Perfect Remote Job",
  description: "Get matched with remote jobs that fit your timezone, async needs, and skills using AI-powered intelligent matching.",
  keywords: ["remote jobs", "job matching", "AI", "async work", "remote work"],
  openGraph: {
    title: "matchremote - Find Your Perfect Remote Job",
    description: "Get matched with remote jobs that fit your timezone, async needs, and skills using AI-powered intelligent matching.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-white antialiased">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

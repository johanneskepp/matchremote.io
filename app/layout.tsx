import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "matchremote — Find remote work that actually fits",
  description: "Skip the endless scrolling. Answer 15 questions and get remote jobs matched to your life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

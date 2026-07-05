import type { Metadata } from "next";
import "./globals.css"; // 💖 THIS IS THE CRITICAL LINE THAT LOADS YOUR STYLES!

export const metadata: Metadata = {
  title: "My Closet ✨",
  description: "Your curated physical collection, digitized.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
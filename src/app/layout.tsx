import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GrainOverlay from "@/components/ui/GrainOverlay";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Miles by Mudita — AI Startup Idea Validation",
  description:
    "Validate your startup idea with institutional-grade research. Miles scores your concept across 5 dimensions and delivers a comprehensive PDF report.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-navy-950 text-cream-100 font-body antialiased">
        <SessionProvider>
          <GrainOverlay />
          <Header />
          <main className="pt-16">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}

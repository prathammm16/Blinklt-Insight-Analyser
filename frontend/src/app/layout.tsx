import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AnalysisProvider } from "@/context/AnalysisContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Blinkit Insight AI — Product Research",
  description:
    "Multi-Source AI Discovery Engine for Blinkit customer reviews. Uncover themes, JTBD, pain points and growth opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full antialiased">
        <AnalysisProvider>{children}</AnalysisProvider>
      </body>
    </html>
  );
}

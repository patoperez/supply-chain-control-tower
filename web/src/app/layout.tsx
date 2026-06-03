import type { Metadata } from "next";
import { Fraunces, Spline_Sans, Spline_Sans_Mono } from "next/font/google";
import "@/styles/globals.css";

// Serif display headlines (variable font: weights 400–600 via utilities)
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

// Clean technical sans for body / UI
const splineSans = Spline_Sans({
  subsets: ["latin"],
  variable: "--font-spline-sans",
  display: "swap",
});

// Instrument-readout mono for every number, SKU, date, and code
const splineSansMono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-spline-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Supply Chain Control Tower — Service Analyst Case Study",
  description:
    "An end-to-end supply-chain analysis: a simulated distribution network, the messy raw data, the cleaning, the findings, an interactive control tower, and an explainable stock-out risk model. 100% synthetic data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${splineSans.variable} ${splineSansMono.variable}`}
    >
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}

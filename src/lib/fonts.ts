import { Instrument_Serif, Literata, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

// Default theme: Headlines
export const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-serif",
});

// Focused theme: Headlines + Body
export const literata = Literata({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-literata",
});

// Colorful theme: Body
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

// Default theme: Body
export const satoshi = localFont({
  src: [
    { path: "../fonts/Satoshi-Variable.woff2", style: "normal" },
    { path: "../fonts/Satoshi-VariableItalic.woff2", style: "italic" },
  ],
  display: "swap",
  variable: "--font-satoshi",
});

// Colorful theme: Headlines
export const clashDisplay = localFont({
  src: [{ path: "../fonts/ClashDisplay-Variable.woff2", style: "normal" }],
  display: "swap",
  variable: "--font-clash-display",
});

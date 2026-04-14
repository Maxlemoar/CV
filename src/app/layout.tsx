import type { Metadata } from "next";
import { SettingsProvider } from "@/lib/preferences";
import { ExperimentProvider } from "@/lib/experiment-context";
import ThemeApplicator from "./ThemeApplicator";
import {
  instrumentSerif,
  literata,
  jetbrainsMono,
  satoshi,
  clashDisplay,
} from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maximilian Marowsky — Product Manager",
  description:
    "Psychologist turned Product Manager, building the future of learning with AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${satoshi.variable} ${literata.variable} ${clashDisplay.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        <ExperimentProvider>
          <SettingsProvider>
            <ThemeApplicator>
              {children}
            </ThemeApplicator>
          </SettingsProvider>
        </ExperimentProvider>
      </body>
    </html>
  );
}

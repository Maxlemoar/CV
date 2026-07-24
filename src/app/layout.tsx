import type { Metadata } from "next";
import { SettingsProvider } from "@/lib/preferences";
import { ExperimentProvider } from "@/lib/experiment-context";
import { EggProvider } from "@/lib/egg-context";
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
    "From founding an EdTech startup to prototyping with Claude Code at 5am — founder and product manager who loves building things from scratch.",
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
            <EggProvider>
              <ThemeApplicator>
                {children}
              </ThemeApplicator>
            </EggProvider>
          </SettingsProvider>
        </ExperimentProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { PreferencesProvider } from "@/lib/preferences";
import ThemeApplicator from "./ThemeApplicator";
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
    <html lang="en">
      <body className="antialiased">
        <PreferencesProvider>
          <ThemeApplicator>
            {children}
          </ThemeApplicator>
        </PreferencesProvider>
      </body>
    </html>
  );
}

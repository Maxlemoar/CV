"use client";

import { Suspense } from "react";
import CuriosityProvider, { useCuriosity } from "@/components/CuriosityProvider";
import CuriosityScreen from "@/components/CuriosityScreen";
import InteractivePage from "@/components/InteractivePage";
import Nav from "@/components/Nav";
import { type CuriosityMode } from "@/lib/curiosity-config";

function PageContent() {
  const { mode, setMode } = useCuriosity();

  if (!mode) {
    return <CuriosityScreen onSelect={setMode} />;
  }

  return (
    <>
      <Nav />
      <InteractivePage />
    </>
  );
}

export default function Home() {
  return (
    <Suspense>
      <CuriosityProvider>
        <PageContent />
      </CuriosityProvider>
    </Suspense>
  );
}

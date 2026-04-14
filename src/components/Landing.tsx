"use client";

import ExperimentHook from "./ExperimentHook";

interface LandingProps {
  onStartJourney: (experimentNumber: number) => void;
}

export default function Landing({ onStartJourney }: LandingProps) {
  return <ExperimentHook onStart={onStartJourney} />;
}

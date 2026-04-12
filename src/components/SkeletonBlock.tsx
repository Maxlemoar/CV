"use client";

export default function SkeletonBlock() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-6 shadow-neu sm:p-8">
      <div className="mb-3 h-3 w-24 rounded bg-paper-dark" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-paper-dark" />
        <div className="h-4 w-5/6 rounded bg-paper-dark" />
        <div className="h-4 w-4/6 rounded bg-paper-dark" />
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-8 w-32 rounded-xl bg-paper-dark" />
        <div className="h-8 w-28 rounded-xl bg-paper-dark" />
      </div>
    </div>
  );
}

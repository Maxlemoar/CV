"use client";

import Image from "next/image";
import type { RichType, RichData, StatItem, TimelineItem, ProjectData, TagsData, CitationData, PhotoData } from "@/lib/types";

interface RichElementProps {
  richType: RichType;
  richData: RichData;
}

export default function RichElement({ richType, richData }: RichElementProps) {
  switch (richType) {
    case "stats":
      return <Stats items={richData as StatItem[]} />;
    case "timeline":
      return <Timeline items={richData as TimelineItem[]} />;
    case "project":
      return <Project data={richData as ProjectData} />;
    case "tags":
      return <Tags data={richData as TagsData} />;
    case "citation":
      return <Citation data={richData as CitationData} />;
    case "photo":
      return <Photo data={richData as PhotoData} />;
    default:
      return null;
  }
}

function Stats({ items }: { items: StatItem[] }) {
  return (
    <div className="mt-4 flex gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex-1 rounded-xl bg-paper p-3 text-center">
          <div className="text-lg font-bold text-accent">{item.value}</div>
          <div className="text-xs text-ink-light">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="mt-4 flex flex-col gap-0">
      {items.map((item, i) => (
        <div key={item.year} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="h-2.5 w-2.5 rounded-full bg-accent" />
            {i < items.length - 1 && <div className="w-0.5 grow bg-paper-dark" style={{ minHeight: 28 }} />}
          </div>
          <p className="pb-3 text-sm text-ink">
            <span className="font-semibold">{item.year}</span> — {item.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function Project({ data }: { data: ProjectData }) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl bg-paper p-4">
      {data.emoji && <span className="text-2xl">{data.emoji}</span>}
      <div>
        <div className="font-semibold text-ink">{data.name}</div>
        <div className="text-sm text-ink-light">{data.description}</div>
      </div>
    </div>
  );
}

function Tags({ data }: { data: TagsData }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {data.tags.map((tag) => (
        <span key={tag} className="rounded-lg bg-paper px-3 py-1 text-xs text-ink-light">
          {tag}
        </span>
      ))}
    </div>
  );
}

function Citation({ data }: { data: CitationData }) {
  return (
    <div className="mt-4 rounded-xl border border-paper-dark bg-paper p-4">
      <div className="font-serif text-sm font-semibold text-ink">{data.title}</div>
      <div className="mt-1 text-xs text-ink-light">{data.authors} · {data.publication} · {data.year}</div>
      {data.url && (
        <a href={data.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-accent hover:underline">
          View publication →
        </a>
      )}
    </div>
  );
}

function Photo({ data }: { data: PhotoData }) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl">
      <Image
        src={data.src}
        alt={data.alt}
        width={400}
        height={500}
        className="h-auto max-h-[28rem] w-full object-contain"
      />
    </div>
  );
}

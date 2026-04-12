"use client";

import Image from "next/image";
import Link from "next/link";
import type { ContentBlockData } from "@/lib/types";
import ContentBlock from "@/components/ContentBlock";

interface Props {
  blocks: ContentBlockData[];
}

export default function SharedSessionView({ blocks }: Props) {
  return (
    <>
      <section className="mb-8 text-center">
        <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full shadow-neu-sm">
          <Image
            src="/photo-coffee.jpg"
            alt="Max Marowsky"
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        </div>
        <h1 className="font-serif text-2xl font-bold text-ink">Max Marowsky</h1>
        <p className="mt-1 text-sm text-ink-light">Discovered by a visitor</p>
      </section>

      <div className="space-y-6">
        {blocks.map((block) => (
          <ContentBlock
            key={block.id}
            block={block}
            onHookClick={() => {}}
            isReadOnly
          />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-block rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white shadow-neu-sm transition-colors hover:bg-accent-hover"
        >
          Start your own conversation with Max →
        </Link>
      </div>
    </>
  );
}

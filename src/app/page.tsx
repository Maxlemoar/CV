import Hero from "@/components/Hero";
import ExplorationView from "@/components/ExplorationView";
import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <main className="relative z-10 mx-auto max-w-3xl px-6 pb-24">
      <Hero />
      <ExplorationView />
      <ChatWidget />
    </main>
  );
}

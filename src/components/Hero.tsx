export default function Hero() {
  return (
    <section className="mx-auto max-w-3xl px-6 pb-8 pt-20 text-center">
      <div className="mx-auto mb-6 flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-paper-dark shadow-neu">
        <span className="font-serif text-4xl text-ink-light">MM</span>
      </div>
      <h1 className="font-serif text-4xl font-bold text-ink md:text-5xl">
        Maximilian Marowsky
      </h1>
      <p className="mt-3 text-lg text-ink-light">
        Psychologist turned Product Manager,{" "}
        <span className="text-accent">building the future of learning with AI.</span>
      </p>
    </section>
  );
}

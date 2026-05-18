interface CommentsHeaderProps {
  count: number;
}

function formatCount(n: number) {
  if (n === 0) return "No notes yet";
  if (n === 1) return "1 note this issue";
  return `${n} total comments`;
}

export function CommentsHeader({ count }: CommentsHeaderProps) {
  return (
    <header className="flex flex-col gap-5 lg:gap-6 lg:sticky lg:top-24">
      <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
        <span aria-hidden className="h-px w-10 bg-primary" />
        Reader Notes
      </p>

      <h2 className="font-heading italic leading-[0.95] text-4xl sm:text-5xl lg:text-7xl xl:text-[5rem] font-extrabold">
        What you&apos;re
        <br />
        <span className="not-italic text-primary">thinking.</span>
      </h2>

      <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
        Real voices from readers.
        <br />
        <span>
          Leave a thought, a reaction, a fragment —
          <br />
          anything.
        </span>
      </p>

      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
        {formatCount(count)}
      </span>
    </header>
  );
}

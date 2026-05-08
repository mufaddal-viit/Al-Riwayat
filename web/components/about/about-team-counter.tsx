type AboutTeamCounterProps = {
  current: number;
  total: number;
};

export function AboutTeamCounter({ current, total }: AboutTeamCounterProps) {
  return (
    <p className="font-heading text-2xl tabular-nums text-foreground sm:text-3xl">
      <span>{String(current).padStart(2, "0")}</span>
      <span className="text-muted-foreground/60">
        {" "}
        / {String(total).padStart(2, "0")}
      </span>
    </p>
  );
}

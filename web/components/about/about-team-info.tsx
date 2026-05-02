type AboutTeamInfoProps = {
  name: string;
  role: string;
};

export function AboutTeamInfo({ name, role }: AboutTeamInfoProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <h3 className="font-heading text-2xl sm:text-3xl">{name}</h3>
      <span className="rounded-full border border-border px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {role}
      </span>
    </div>
  );
}

type NowSelectedBadgeProps = {
  name: string;
};

export default function NowSelectedBadge({ name }: NowSelectedBadgeProps) {
  return (
    <div className="absolute bottom-0 right-0 z-10 p-5 sm:p-8">
      <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-md sm:px-5 sm:py-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 sm:text-xs">
          Now Selected
        </p>
        <p className="mt-2 text-base font-medium sm:text-lg">{name}</p>
      </div>
    </div>
  );
}
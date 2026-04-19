import type { Song } from "../types/song";

type SongListProps = {
  loopedSongs: Song[];
  highlightedIndex: number;
  selectedIndex: number;
  listRef: React.RefObject<HTMLDivElement | null>;
  itemRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  isDragging: React.MutableRefObject<boolean>;
  onSongConfirm: (index: number) => void;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
  onPointerCancel: () => void;
  onScroll: () => void;
};

export default function SongList({
  loopedSongs,
  highlightedIndex,
  selectedIndex,
  listRef,
  itemRefs,
  isDragging,
  onSongConfirm,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onScroll,
}: SongListProps) {
  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute left-0 right-3 top-1/2 z-10 h-[58px] -translate-y-1/2 rounded-xl border border-white/16 bg-white/6 backdrop-blur-[2px]" />

      <div
        ref={listRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onPointerCancel={onPointerCancel}
        onScroll={onScroll}
        className="h-full cursor-grab overflow-y-auto pr-3 select-none touch-pan-y [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="space-y-1.5 py-[38vh]">
          {loopedSongs.map((song, index) => {
            const isHighlighted = index === highlightedIndex;
            const isSelected = index === selectedIndex;

            return (
              <button
                key={`${song.id}-${index}`}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                onClick={() => {
                  if (!isDragging.current) {
                    onSongConfirm(index);
                  }
                }}
                type="button"
                className="group relative block w-full text-left"
                aria-pressed={isSelected}
              >
                {isHighlighted && (
                  <div className="pointer-events-none absolute inset-y-0 left-0 right-0 overflow-hidden rounded-xl">
                    <div className="absolute inset-0 rounded-xl border border-white/18 bg-white/8 backdrop-blur-md" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400/20 via-green-300/8 to-transparent" />
                  </div>
                )}

                {isSelected && (
                  <div className="pointer-events-none absolute inset-y-0 left-0 right-0 rounded-xl border border-green-300/30 shadow-[0_0_24px_rgba(74,222,128,0.16)]" />
                )}

                <div
                  className={[
                    "relative z-10 flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-base transition-all duration-150 sm:text-lg",
                    isSelected
                      ? "text-white"
                      : isHighlighted
                        ? "text-white/95"
                        : "text-white/72 group-hover:text-white/92",
                  ].join(" ")}
                >
                  <span className="truncate">{song.name}</span>

                  {isSelected ? (
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.25em] text-green-300/85">
                      Selected
                    </span>
                  ) : isHighlighted ? (
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.25em] text-white/45">
                      Ready
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
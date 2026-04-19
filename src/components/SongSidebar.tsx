import SongList from "./SongList";
import type { Song } from "../types/song";

type SongSidebarProps = {
  menuOpen: boolean;
  noSongsFound: boolean;
  highlightedSong: Song;
  loopedSongs: Song[];
  highlightedIndex: number;
  selectedIndex: number;
  listRef: React.RefObject<HTMLDivElement | null>;
  itemRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  isDragging: React.MutableRefObject<boolean>;
  onToggleMenu: () => void;
  onSongConfirm: (index: number) => void;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
  onPointerCancel: () => void;
  onScroll: () => void;
};

export default function SongSidebar({
  menuOpen,
  noSongsFound,
  highlightedSong,
  loopedSongs,
  highlightedIndex,
  selectedIndex,
  listRef,
  itemRefs,
  isDragging,
  onToggleMenu,
  onSongConfirm,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onScroll,
}: SongSidebarProps) {
  return (
    <div
      className={[
        "absolute left-0 top-0 z-20 h-full w-[320px] max-w-[78vw] transition-all duration-500 ease-out sm:w-[340px]",
        menuOpen ? "translate-x-0 opacity-100" : "-translate-x-[88%] opacity-100",
      ].join(" ")}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={[
          "absolute inset-0 transition-all duration-500 ease-out",
          menuOpen
            ? "bg-gradient-to-r from-green-950/90 via-green-800/38 to-transparent"
            : "bg-gradient-to-r from-green-950/35 via-green-800/10 to-transparent",
        ].join(" ")}
      />
      <div className="absolute inset-0 backdrop-blur-xl" />
      <div
        className={[
          "absolute inset-y-0 right-0 w-px transition-opacity duration-500",
          menuOpen ? "bg-white/10 opacity-100" : "bg-white/10 opacity-25",
        ].join(" ")}
      />

      <button
        onClick={onToggleMenu}
        type="button"
        className="absolute right-2 top-1/2 z-30 flex h-36 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl text-white/85 shadow-lg backdrop-blur-md transition hover:bg-white/15 active:scale-[0.98] sm:h-40 sm:w-16"
        aria-label={menuOpen ? "Collapse song selector" : "Open song selector"}
      >
        {menuOpen ? "‹" : "›"}
      </button>

      <div className="relative z-10 flex h-full flex-col px-5 pb-6 pt-8 pr-[4.5rem] sm:px-6 sm:pb-8 sm:pt-10 sm:pr-20">
        <div className="mb-5 sm:mb-6">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/60 sm:text-xs">
            Irish Club
          </p>
          <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">
            Song Selector
          </h1>
          <p className="mt-2 text-xs leading-5 text-white/70 sm:text-sm">
            {noSongsFound
              ? "Add MP3 files to src/assets/audio."
              : "Scroll to browse. Tap a song to play it."}
          </p>
        </div>

        <SongList
          loopedSongs={loopedSongs}
          highlightedIndex={highlightedIndex}
          selectedIndex={selectedIndex}
          listRef={listRef}
          itemRefs={itemRefs}
          isDragging={isDragging}
          onSongConfirm={onSongConfirm}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
          onPointerCancel={onPointerCancel}
          onScroll={onScroll}
        />

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/45">
            Current Focus
          </p>
          <p className="mt-2 text-sm text-white/82">{highlightedSong.name}</p>
        </div>
      </div>
    </div>
  );
}
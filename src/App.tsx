import { useCallback, useEffect, useRef, useState } from "react";
import BackgroundStage from "./components/BackgroundStage";
import NowSelectedBadge from "./components/NowSelectedBadge";
import SongSidebar from "./components/SongSidebar";
import { BACKGROUND_VIDEO } from "./data/songs";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useInfiniteSongScroller } from "./hooks/useInfiniteSongScroller";

const VIDEO_TRIM_START_SECONDS = 15;
const VIDEO_TRIM_END_SECONDS = 15;

export default function App() {
  const [menuOpen, setMenuOpen] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const {
    loopedSongs,
    noSongsFound,
    selectedSong,
    highlightedSong,
    selectedIndex,
    highlightedIndex,
    listRef,
    itemRefs,
    isDragging,
    handleSongConfirm,
    handlePointerDown,
    handlePointerMove,
    handleScroll,
    endDrag,
  } = useInfiniteSongScroller();

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const confirmSongAndClose = useCallback(
    (index: number) => {
      handleSongConfirm(index, () => setMenuOpen(false));
    },
    [handleSongConfirm]
  );

  useAudioPlayer({
    audioRef,
    selectedFile: selectedSong.file,
    shouldPlay: !menuOpen,
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const seekToTrimmedStart = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;

      const safeStart = Math.min(
        VIDEO_TRIM_START_SECONDS,
        Math.max(0, video.duration - 0.25)
      );

      if (Math.abs(video.currentTime - safeStart) > 0.2) {
        video.currentTime = safeStart;
      }
    };

    const handleLoadedMetadata = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;

      if (video.duration > VIDEO_TRIM_START_SECONDS + VIDEO_TRIM_END_SECONDS) {
        seekToTrimmedStart();
      }

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Browser may block autoplay depending on environment.
        });
      }
    };

    const handleTimeUpdate = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;

      const trimmedEnd = video.duration - VIDEO_TRIM_END_SECONDS;

      if (
        video.duration > VIDEO_TRIM_START_SECONDS + VIDEO_TRIM_END_SECONDS &&
        video.currentTime >= trimmedEnd
      ) {
        seekToTrimmedStart();
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Browser may block autoplay depending on environment.
      });
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-[#040404] text-white">
      <audio ref={audioRef} preload="metadata">
        <source src={selectedSong.file} type="audio/mpeg" />
      </audio>

      <div className="h-screen w-full p-3 sm:p-4">
        <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-2xl">
          <BackgroundStage
            backgroundVideo={BACKGROUND_VIDEO}
            selectedSong={selectedSong}
            highlightedSong={highlightedSong}
            videoRef={videoRef}
            onCloseMenu={closeMenu}
          />

          <div
            className={[
              "pointer-events-none absolute inset-0 z-10 transition-all duration-500 ease-out",
              menuOpen
                ? "bg-gradient-to-r from-green-900/75 via-green-700/20 to-transparent opacity-100"
                : "bg-gradient-to-r from-green-900/18 via-green-700/04 to-transparent opacity-35",
            ].join(" ")}
          />

          <SongSidebar
            menuOpen={menuOpen}
            noSongsFound={noSongsFound}
            highlightedSong={highlightedSong}
            loopedSongs={loopedSongs}
            highlightedIndex={highlightedIndex}
            selectedIndex={selectedIndex}
            listRef={listRef}
            itemRefs={itemRefs}
            isDragging={isDragging}
            onToggleMenu={toggleMenu}
            onSongConfirm={confirmSongAndClose}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onPointerCancel={endDrag}
            onScroll={handleScroll}
          />

          <NowSelectedBadge name={selectedSong.name} />
        </div>
      </div>
    </div>
  );
}
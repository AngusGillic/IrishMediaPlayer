import type { Song } from "../types/song";

type BackgroundStageProps = {
  backgroundVideo: string;
  selectedSong: Song;
  highlightedSong: Song;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onCloseMenu: () => void;
};

export default function BackgroundStage({
  backgroundVideo,
  selectedSong,
  highlightedSong,
  videoRef,
  onCloseMenu,
}: BackgroundStageProps) {
  return (
    <div className="absolute inset-0 cursor-pointer" onClick={onCloseMenu}>
      <div className="relative h-full w-full bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={backgroundVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.18)_100%)]" />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
          <div className="w-full max-w-xl text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">
              Now Playing
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-wide sm:text-4xl">
              {selectedSong.name}
            </h2>

            <p className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white/70 backdrop-blur-md">
              <span className="text-white/45">Browsing:</span>
              <span>{highlightedSong.name}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
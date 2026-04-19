import type { Song } from "../types/song";

export const BACKGROUND_VIDEO = "/media/video/irish-landscape.mp4";

export const AUDIO_FADE_DURATION_MS = 450;
export const AUDIO_FADE_INTERVAL_MS = 30;

export const COPY_COUNT = 7;
export const MIDDLE_COPY = Math.floor(COPY_COUNT / 2);

export const EMPTY_SONG: Song = {
  id: "",
  name: "No Songs Found",
  file: "",
};

const audioModules = import.meta.glob("../assets/audio/*.mp3", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const toTitleCaseFromSlug = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export const discoveredSongs: Song[] = Object.entries(audioModules)
  .map(([path, file]) => {
    const filename = path.split("/").pop()?.replace(/\.mp3$/i, "") ?? "";

    return {
      id: filename,
      name: toTitleCaseFromSlug(filename),
      file,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const BASE_LENGTH = discoveredSongs.length;

export const INITIAL_INDEX = BASE_LENGTH > 0 ? BASE_LENGTH * MIDDLE_COPY : 0;

export const LOOPED_SONGS: Song[] =
  BASE_LENGTH > 0
    ? Array.from({ length: COPY_COUNT }, () => discoveredSongs).flat()
    : [];
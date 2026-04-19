import { useCallback, useEffect, useRef } from "react";
import {
  AUDIO_FADE_DURATION_MS,
  AUDIO_FADE_INTERVAL_MS,
} from "../data/songs";

type UseAudioPlayerOptions = {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  selectedFile: string;
  shouldPlay: boolean;
};

const END_FADE_DURATION_SECONDS = 4;

export function useAudioPlayer({
  audioRef,
  selectedFile,
  shouldPlay,
}: UseAudioPlayerOptions) {
  const audioFadeInterval = useRef<number | null>(null);
  const endingFadeActive = useRef(false);

  const clearAudioFade = useCallback(() => {
    if (audioFadeInterval.current !== null) {
      window.clearInterval(audioFadeInterval.current);
      audioFadeInterval.current = null;
    }
  }, []);

  const fadeInAndPlayAudio = useCallback(
    async (audio: HTMLAudioElement) => {
      clearAudioFade();
      endingFadeActive.current = false;
      audio.volume = 0;

      try {
        await audio.play();
      } catch {
        return;
      }

      const steps = Math.max(
        1,
        Math.floor(AUDIO_FADE_DURATION_MS / AUDIO_FADE_INTERVAL_MS)
      );

      let currentStep = 0;

      audioFadeInterval.current = window.setInterval(() => {
        currentStep += 1;
        audio.volume = Math.min(1, currentStep / steps);

        if (currentStep >= steps) {
          audio.volume = 1;
          clearAudioFade();
        }
      }, AUDIO_FADE_INTERVAL_MS);
    },
    [clearAudioFade]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!shouldPlay) return;
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

      const remaining = audio.duration - audio.currentTime;

      if (remaining <= END_FADE_DURATION_SECONDS) {
        endingFadeActive.current = true;

        const nextVolume = Math.max(0, remaining / END_FADE_DURATION_SECONDS);
        audio.volume = Math.min(audio.volume, nextVolume);
      } else if (!endingFadeActive.current) {
        audio.volume = 1;
      }
    };

    const handleEnded = () => {
      audio.volume = 0;
      endingFadeActive.current = false;
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioRef, shouldPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    clearAudioFade();
    endingFadeActive.current = false;
    audio.pause();
    audio.load();

    if (shouldPlay && selectedFile.trim() !== "") {
      fadeInAndPlayAudio(audio);
    } else {
      audio.volume = 1;
    }
  }, [audioRef, selectedFile, shouldPlay, fadeInAndPlayAudio, clearAudioFade]);

  useEffect(() => {
    return () => {
      clearAudioFade();
    };
  }, [clearAudioFade]);
}
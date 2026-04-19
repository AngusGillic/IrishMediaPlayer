import { useCallback, useEffect, useRef, useState } from "react";
import {
  BASE_LENGTH,
  COPY_COUNT,
  EMPTY_SONG,
  INITIAL_INDEX,
  LOOPED_SONGS,
  MIDDLE_COPY,
  discoveredSongs,
} from "../data/songs";
import type { Song } from "../types/song";

export function useInfiniteSongScroller() {
  const [highlightedIndex, setHighlightedIndex] = useState(INITIAL_INDEX);
  const [selectedIndex, setSelectedIndex] = useState(INITIAL_INDEX);

  const listRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isPointerDown = useRef(false);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);

  const hasInitialised = useRef(false);
  const isProgrammaticScroll = useRef(false);
  const isRebasing = useRef(false);

  const smoothScrollTimeout = useRef<number | null>(null);
  const rebaseTimeout = useRef<number | null>(null);

  const loopedSongs = LOOPED_SONGS;
  const noSongsFound = BASE_LENGTH === 0;

  const getSongAtIndex = useCallback(
    (index: number): Song =>
      loopedSongs[index] ?? discoveredSongs[0] ?? EMPTY_SONG,
    [loopedSongs]
  );

  const selectedSong = getSongAtIndex(selectedIndex);
  const highlightedSong = getSongAtIndex(highlightedIndex);

  const clearSmoothScrollTimeout = useCallback(() => {
    if (smoothScrollTimeout.current !== null) {
      window.clearTimeout(smoothScrollTimeout.current);
      smoothScrollTimeout.current = null;
    }
  }, []);

  const clearRebaseTimeout = useCallback(() => {
    if (rebaseTimeout.current !== null) {
      window.clearTimeout(rebaseTimeout.current);
      rebaseTimeout.current = null;
    }
  }, []);

  const getBaseIndex = useCallback((index: number) => {
    if (BASE_LENGTH === 0) return 0;
    return ((index % BASE_LENGTH) + BASE_LENGTH) % BASE_LENGTH;
  }, []);

  const getMiddleCopyIndex = useCallback(
    (index: number) => {
      if (BASE_LENGTH === 0) return 0;
      return MIDDLE_COPY * BASE_LENGTH + getBaseIndex(index);
    },
    [getBaseIndex]
  );

  const scrollItemToCenter = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const container = listRef.current;
      const item = itemRefs.current[index];

      if (!container || !item) return;

      const targetTop =
        item.offsetTop - container.clientHeight / 2 + item.clientHeight / 2;

      if (behavior === "smooth") {
        isProgrammaticScroll.current = true;
        clearSmoothScrollTimeout();

        smoothScrollTimeout.current = window.setTimeout(() => {
          isProgrammaticScroll.current = false;
          smoothScrollTimeout.current = null;
        }, 350);
      }

      container.scrollTo({
        top: targetTop,
        behavior,
      });
    },
    [clearSmoothScrollTimeout]
  );

  const getClosestIndexToCenter = useCallback(() => {
    const container = listRef.current;
    if (!container || loopedSongs.length === 0) return highlightedIndex;

    const containerCenter = container.scrollTop + container.clientHeight / 2;
    let closestIndex = highlightedIndex;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < loopedSongs.length; i += 1) {
      const item = itemRefs.current[i];
      if (!item) continue;

      const itemCenter = item.offsetTop + item.clientHeight / 2;
      const distance = Math.abs(itemCenter - containerCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    return closestIndex;
  }, [highlightedIndex, loopedSongs]);

  const updateHighlightFromScroll = useCallback(() => {
    setHighlightedIndex(getClosestIndexToCenter());
  }, [getClosestIndexToCenter]);

  const recenterIfNeeded = useCallback(() => {
    const container = listRef.current;
    if (!container || BASE_LENGTH === 0) return 0;

    const singleListHeight = container.scrollHeight / COPY_COUNT;
    const currentScroll = container.scrollTop;

    if (currentScroll < singleListHeight * 1.0) {
      container.scrollTop = currentScroll + singleListHeight;
      return BASE_LENGTH;
    }

    if (currentScroll > singleListHeight * (COPY_COUNT - 2.0)) {
      container.scrollTop = currentScroll - singleListHeight;
      return -BASE_LENGTH;
    }

    return 0;
  }, []);

  const rebaseSelectionToMiddleCopy = useCallback(
    (sourceIndex: number) => {
      const container = listRef.current;
      if (!container || BASE_LENGTH === 0) return;

      const safeIndex = getMiddleCopyIndex(sourceIndex);
      const indexShift = safeIndex - sourceIndex;

      if (indexShift === 0) return;

      const singleListHeight = container.scrollHeight / COPY_COUNT;
      const copyShift = indexShift / BASE_LENGTH;

      isRebasing.current = true;
      container.scrollTop += singleListHeight * copyShift;
      setHighlightedIndex(safeIndex);
      setSelectedIndex(safeIndex);

      requestAnimationFrame(() => {
        scrollItemToCenter(safeIndex, "auto");

        requestAnimationFrame(() => {
          isRebasing.current = false;
        });
      });
    },
    [getMiddleCopyIndex, scrollItemToCenter]
  );

  const handleSongConfirm = useCallback(
    (index: number, onConfirmed?: () => void) => {
      clearRebaseTimeout();
      setHighlightedIndex(index);
      setSelectedIndex(index);
      onConfirmed?.();
      scrollItemToCenter(index, "smooth");

      rebaseTimeout.current = window.setTimeout(() => {
        rebaseSelectionToMiddleCopy(index);
        rebaseTimeout.current = null;
      }, 380);
    },
    [clearRebaseTimeout, rebaseSelectionToMiddleCopy, scrollItemToCenter]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!listRef.current) return;

      clearRebaseTimeout();
      isPointerDown.current = true;
      isDragging.current = false;
      startY.current = e.clientY;
      startScrollTop.current = listRef.current.scrollTop;

      listRef.current.style.cursor = "grabbing";
      listRef.current.style.userSelect = "none";
    },
    [clearRebaseTimeout]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown.current || !listRef.current) return;

    const deltaY = e.clientY - startY.current;

    if (Math.abs(deltaY) > 6) {
      isDragging.current = true;
    }

    if (isDragging.current) {
      listRef.current.scrollTop = startScrollTop.current - deltaY;
    }
  }, []);

  const endDrag = useCallback(() => {
    const container = listRef.current;

    isPointerDown.current = false;

    if (container) {
      container.style.cursor = "grab";
      container.style.userSelect = "auto";
    }

    window.setTimeout(() => {
      isDragging.current = false;
    }, 0);
  }, []);

  const handleScroll = useCallback(() => {
    if (isProgrammaticScroll.current || isRebasing.current) return;

    const indexShift = recenterIfNeeded();

    if (indexShift !== 0) {
      setHighlightedIndex((prev) => prev + indexShift);
      setSelectedIndex((prev) => prev + indexShift);
      return;
    }

    updateHighlightFromScroll();
  }, [recenterIfNeeded, updateHighlightFromScroll]);

  useEffect(() => {
    if (hasInitialised.current || BASE_LENGTH === 0) return;

    requestAnimationFrame(() => {
      scrollItemToCenter(INITIAL_INDEX, "auto");
    });

    hasInitialised.current = true;
  }, [scrollItemToCenter]);

  useEffect(() => {
    return () => {
      clearSmoothScrollTimeout();
      clearRebaseTimeout();
    };
  }, [clearSmoothScrollTimeout, clearRebaseTimeout]);

  return {
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
  };
}
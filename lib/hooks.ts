import { useCallback, useEffect, useMemo, useState } from "react";
import type { MediaState } from "@/lib/types";

/**
 * Custom Hook: useGetMediaState
 *
 * Manages the media state (e.g., played time, duration, and favorite status) and persists the state to localStorage.
 *
 * @returns {object} - Returns the media states, a function to update media state, and a list of favorite media IDs.
 */
export const useGetMediaState = () => {
  const [mediaStates, setMediaStates] = useState<MediaState[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedState = localStorage.getItem("storedMediaState");
        const saved = storedState ? JSON.parse(storedState) : [];
        return Array.isArray(saved)
          ? saved.filter(
              (item) =>
                item &&
                Number.isFinite(item.id) &&
                Number.isFinite(item.playedSeconds) &&
                Number.isFinite(item.duration) &&
                typeof item.isFavorite === "boolean",
            )
          : [];
      } catch (e) {
        console.error("Error parsing stored media state", e); // Handle JSON parse errors
        return [];
      }
    }
    return [];
  });

  /**
   * Updates the media state for a specific media item.
   *
   * @param {number} id - The ID of the media item.
   * @param {number} playedSeconds - The number of seconds the media has been played.
   * @param {number} duration - The total duration of the media.
   * @param {boolean} isFavorite - Whether the media item is marked as a favorite.
   */
  const updateMediaState = useCallback(
    (
      id: number,
      playedSeconds: number,
      duration: number,
      isFavorite: boolean,
    ) => {
      setMediaStates((prevState) => {
        const existingItemIndex = prevState.findIndex((item) => item.id === id);

        if (existingItemIndex !== -1) {
          const updatedState = [...prevState];
          updatedState[existingItemIndex] = {
            ...updatedState[existingItemIndex],
            playedSeconds,
            duration,
            isFavorite,
          };
          return updatedState;
        } else {
          return [...prevState, { id, playedSeconds, duration, isFavorite }];
        }
      });
    },
    [],
  );

  // Save media state to localStorage, debounced to avoid frequent updates
  useEffect(() => {
    const saveToLocalStorage = setTimeout(() => {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("storedMediaState", JSON.stringify(mediaStates));
        } catch {
          // Private browsing/storage limits should not interrupt listening.
        }
      }
    }, 500); // Save state after 500ms delay

    return () => clearTimeout(saveToLocalStorage); // Cleanup the timeout on unmount
  }, [mediaStates]);

  // Memoize favorite IDs to prevent unnecessary recalculations
  const favoriteIds = useMemo(() => {
    return mediaStates.reduce((acc: number[], val) => {
      if (val.isFavorite) {
        acc.push(val.id); // Add favorite item ID
      }
      return acc;
    }, []);
  }, [mediaStates]);

  return {
    mediaStates,
    setMediaStates,
    updateMediaState,
    favoriteIds,
  };
};

/**
 * Possible Refactoring Ideas:
 * 1. **Memoization**: Enhance performance by memoizing complex computations such as filtering and media state updates.
 * 2. **TypeScript Enhancements**: Use stricter types for props like `homePost[]`, `favoriteItems`, etc., to prevent invalid data from being passed.
 * 3. **Error Handling**: Add error handling for unexpected values in media state or API responses.
 * 4. **Debounce**: The debouncing logic in `useGetMediaState` can be made more flexible by allowing customizable debounce delay.
 * 5. **Performance Optimization**: Use `useTransition` from React 18 for smoother transitions when dealing with filtering large datasets.
 */

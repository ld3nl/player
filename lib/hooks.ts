import { useEffect, useState, useCallback, useMemo } from "react";
import { homePost, MediaState } from "@/lib/types";

/**
 * Custom Hook: useLockScroll
 *
 * This hook locks the scroll when a modal or any other element that needs to disable scrolling is active.
 * It listens for touch and arrow key events to prevent scrolling when `isOpen` is true.
 *
 * @param {boolean} isOpen - Boolean value indicating whether scrolling should be locked.
 */
export const useLockScroll = (isOpen: boolean): void => {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const originalStyle = document.body.style.overflow;
    const handleTouchMove = (e: TouchEvent) => isOpen && e.preventDefault(); // Prevent touch scrolling
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault(); // Prevent scrolling with arrow keys
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden"; // Disable scroll by hiding overflow
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      }); // Disable touch scrolling
      document.addEventListener("keydown", handleKeyDown); // Disable arrow key scrolling
    }

    return () => {
      document.body.style.overflow = originalStyle; // Restore scroll on cleanup
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);
};

export default useLockScroll;

/**
 * Custom Hook: useFilteredPosts
 *
 * This hook filters posts by favorites, selected categories, and search terms.
 * The filtering logic is memoized to optimize performance.
 *
 * @param {homePost[]} posts - Array of all posts.
 * @param {number[]} favoriteItems - Array of favorite post IDs.
 * @param {string[]} searchArray - Array of search terms to filter posts by title.
 * @param {number[]} categoryIds - Array of selected category IDs.
 * @returns {object} - Returns filtered posts, a function to trigger filtering, and filtered category IDs.
 */
export const useFilteredPosts = (
  posts: homePost[],
  favoriteItems: number[],
  searchArray: string[],
  categoryIds: number[],
) => {
  const [filteredPosts, setFilteredPosts] = useState<homePost[]>(() => posts); // Initialize state with posts
  const [filteredPostsCategory, setFilteredPostsCategory] = useState<number[]>(
    [],
  ); // Store filtered categories

  // Filter logic wrapped in useCallback to ensure it only recalculates when dependencies change
  const performFiltering = useCallback(() => {
    let newFilteredPosts = [...posts]; // Copy posts to avoid mutation

    // Filter by favorites if any favorite items are selected
    if (favoriteItems.length > 0) {
      newFilteredPosts = newFilteredPosts.filter((post) =>
        favoriteItems.includes(post.id),
      );
    }

    // Filter by selected categories
    if (categoryIds.length > 0) {
      newFilteredPosts = newFilteredPosts.filter((post) =>
        post.categories.some((category) => categoryIds.includes(category.id)),
      );
    }

    // Filter by search terms (debounced for performance)
    if (searchArray.length > 0) {
      newFilteredPosts = newFilteredPosts.filter((post) =>
        searchArray.some((term) =>
          post.title?.toLowerCase().includes(term.toLowerCase()),
        ),
      );
    }

    return newFilteredPosts; // Return the final filtered list
  }, [posts, favoriteItems, categoryIds, searchArray]);

  // Memoize unique category IDs from filtered posts
  const uniqueCategoryIds = useMemo(() => {
    return Array.from(
      new Set(
        filteredPosts.flatMap((post) =>
          post.categories.map((category) => category.id),
        ),
      ),
    );
  }, [filteredPosts]);

  // Trigger filtering and update state if necessary
  const filterPosts = useCallback(() => {
    const newFilteredPosts = performFiltering();

    if (JSON.stringify(newFilteredPosts) !== JSON.stringify(filteredPosts)) {
      setFilteredPosts(newFilteredPosts); // Update posts if they've changed
    }
    if (
      JSON.stringify(uniqueCategoryIds) !==
      JSON.stringify(filteredPostsCategory)
    ) {
      setFilteredPostsCategory(uniqueCategoryIds); // Update categories if they've changed
    }
  }, [
    performFiltering,
    filteredPosts,
    filteredPostsCategory,
    uniqueCategoryIds,
  ]);

  return { filteredPosts, filterPosts, filteredPostsCategory };
};

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
      const storedState = localStorage.getItem("storedMediaState");
      try {
        return storedState ? JSON.parse(storedState) : []; // Parse state from localStorage or default to an empty array
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
  /**
   * Updates the media state for a specific media item.
   *
   * @param {MediaState} mediaState - The media state object containing id, playedSeconds, duration, and isFavorite.
   */
  const updateMediaState = ({
    id,
    playedSeconds,
    duration,
    isFavorite,
  }: MediaState) => {
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
  };

  // Save media state to localStorage, debounced to avoid frequent updates
  useEffect(() => {
    const saveToLocalStorage = setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("storedMediaState", JSON.stringify(mediaStates));
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

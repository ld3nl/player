import { useEffect, useState, useCallback, useMemo } from "react";
import { homePost, MediaState } from "@/lib/types";

export const useLockScroll = (isOpen: boolean): void => {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const originalStyle = document.body.style.overflow;
    const handleTouchMove = (e: TouchEvent) => isOpen && e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = originalStyle;
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);
};

export default useLockScroll;

// Custom hook to filter posts by favorites, categories, and search terms
export const useFilteredPosts = (
  posts: homePost[], // List of all posts
  favoriteItems: number[], // Array of favorite post IDs
  searchArray: string[], // Array of search terms
  categoryIds: number[], // Array of selected category IDs
) => {
  // Store filtered posts and filtered category IDs
  const [filteredPosts, setFilteredPosts] = useState<homePost[]>(() => posts);
  const [filteredPostsCategory, setFilteredPostsCategory] = useState<number[]>(
    [],
  );

  // Memoize filtering logic to prevent unnecessary re-renders
  const performFiltering = useCallback(() => {
    let newFilteredPosts = [...posts]; // Make a copy to avoid mutating the original array

    // 1. Filter by favorite items
    if (favoriteItems.length > 0) {
      newFilteredPosts = newFilteredPosts.filter((post) =>
        favoriteItems.includes(post.id),
      );
    }

    // 2. Filter by selected categories
    if (categoryIds.length > 0) {
      newFilteredPosts = newFilteredPosts.filter((post) =>
        post.categories.some((category) => categoryIds.includes(category.id)),
      );
    }

    // 3. Filter by search terms (debounced for performance)
    if (searchArray.length > 0) {
      newFilteredPosts = newFilteredPosts.filter((post) =>
        searchArray.some((term) =>
          post.title?.toLowerCase().includes(term.toLowerCase()),
        ),
      );
    }

    // Return the final filtered array
    return newFilteredPosts;
  }, [posts, favoriteItems, categoryIds, searchArray]); // Only re-run when dependencies change

  // Memoize unique category IDs from filtered posts to optimize performance
  const uniqueCategoryIds = useMemo(() => {
    return Array.from(
      new Set(
        filteredPosts.flatMap((post) =>
          post.categories.map((category) => category.id),
        ),
      ),
    );
  }, [filteredPosts]);

  // Function to trigger the filtering process
  const filterPosts = useCallback(() => {
    const newFilteredPosts = performFiltering();

    // Only update state if filtered posts or categories have changed
    if (JSON.stringify(newFilteredPosts) !== JSON.stringify(filteredPosts)) {
      setFilteredPosts(newFilteredPosts);
    }
    if (
      JSON.stringify(uniqueCategoryIds) !==
      JSON.stringify(filteredPostsCategory)
    ) {
      setFilteredPostsCategory(uniqueCategoryIds);
    }
  }, [
    performFiltering,
    filteredPosts,
    filteredPostsCategory,
    uniqueCategoryIds,
  ]);

  // Return the filtered posts, filtering function, and categories
  return { filteredPosts, filterPosts, filteredPostsCategory };
};

/**
 * Custom hook to manage media state.
 *
 * @returns {object} - An object containing media states, a function to set media states, and a function to update media state.
 */
export const useGetMediaState = () => {
  const [mediaStates, setMediaStates] = useState<MediaState[]>(() => {
    // Initialize state from localStorage if available
    if (typeof window !== "undefined") {
      const storedState = localStorage.getItem("storedMediaState");
      try {
        return storedState ? JSON.parse(storedState) : [];
      } catch (e) {
        console.error("Error parsing stored media state", e);
        return [];
      }
    }
    return [];
  });

  /**
   * Updates the media state for a given media item.
   *
   * @param {number} id - The ID of the media item.
   * @param {number} playedSeconds - The number of seconds the media has been played.
   * @param {number} duration - The total duration of the media.
   */
  const updateMediaState = (
    id: number,
    playedSeconds: number,
    duration: number,
    isFavorite: boolean,
  ) => {
    setMediaStates((prevState) => {
      const existingItemIndex = prevState.findIndex((item) => item.id === id);

      if (existingItemIndex !== -1) {
        // Update existing media state
        const updatedState = [...prevState];
        updatedState[existingItemIndex] = {
          ...updatedState[existingItemIndex],
          playedSeconds,
          duration,
          isFavorite,
        };
        return updatedState;
      } else {
        // Add new media state
        return [...prevState, { id, playedSeconds, duration, isFavorite }];
      }
    });
  };

  // Persist media states to localStorage, debounced to avoid too many writes
  useEffect(() => {
    const saveToLocalStorage = setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("storedMediaState", JSON.stringify(mediaStates));
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(saveToLocalStorage); // Cleanup timeout
  }, [mediaStates]);

  // Memoize favorite IDs to avoid unnecessary recalculations
  const favoriteIds = useMemo(() => {
    return mediaStates.reduce((acc: number[], val) => {
      if (val.isFavorite) {
        acc.push(val.id);
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

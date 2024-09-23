import { useEffect, useState, useCallback, useMemo } from "react";
import { homePost, Category, MediaState } from "@/lib/types";

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

export const useFilteredPosts = (
  posts: homePost[],
  favoriteItems: number[],
  searchArray: string[],
  categoryIds: number[],
) => {
  const [filteredPosts, setFilteredPosts] = useState<homePost[]>(() => posts);
  const [filteredPostsCategory, setFilteredPostsCategory] = useState<any>([]);

  // Helper function to perform the actual filtering
  const performFiltering = useCallback(() => {
    let newFilteredPosts = posts;

    if (favoriteItems.length > 0) {
      newFilteredPosts = newFilteredPosts.filter((post) =>
        favoriteItems.includes(post.id),
      );
    }

    if (categoryIds.length > 0) {
      newFilteredPosts = newFilteredPosts.filter((post) =>
        post.categories.some(
          (category) => category?.id && categoryIds.includes(category.id),
        ),
      );
    }

    if (searchArray.length > 0) {
      newFilteredPosts = newFilteredPosts.filter((post) => {
        const { title } = post;

        return searchArray.some((word) =>
          title?.toLowerCase().includes(word.toLowerCase()),
        );
      });
    }

    // Should return the filtered posts array
    return newFilteredPosts;
  }, [posts, favoriteItems, categoryIds, searchArray]);

  // Exposing a function that can be used to manually trigger filtering
  const filterPosts = () => {
    const newFilteredPosts = performFiltering();

    const flattenedAndUniqueIds = Array.from(
      new Set(
        newFilteredPosts.flatMap((post: homePost) =>
          post.categories
            .filter((cat): cat is Category => cat !== null && cat !== undefined) // Ensure `cat` is not null or undefined
            .map((cat) => cat.id),
        ),
      ),
    );

    setFilteredPostsCategory(flattenedAndUniqueIds);

    setFilteredPosts(newFilteredPosts);
  };

  return { filteredPosts, filterPosts, filteredPostsCategory };
};

/**
 * Custom hook to manage media state.
 *
 * @returns {object} - An object containing media states, a function to set media states, and a function to update media state.
 */
export const useGetMediaState = () => {
  console.log("useGetMediaState", "isTriggered");
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
  // todo: when item is liked favoriteIds only updated after 2dn click
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

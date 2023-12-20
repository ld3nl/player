import { useEffect, useState, useCallback } from "react";

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

// Improved Post type (example)
type Post = {
  id: number;
  audioUrl: string;
  title: any;
  date: string;
};

/**
 * Custom hook for filtering posts based on search criteria and favorite items.
 *
 * @param {Post[]} posts - Array of posts to be filtered.
 * @param {number[]} favoriteItems - Array of IDs for favorite posts.
 * @param {string[]} searchArray - Array of search terms for filtering.
 * @returns Object containing filtered posts and filter function.
 */
export const useFilteredPosts = (
  posts: Post[],
  favoriteItems: number[],
  searchArray: string[]
) => {
  // State to store the filtered list of posts.
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);

  // Debug: Initial state of posts and favoriteItems
  console.log("Initial posts:", posts);
  console.log("Initial favoriteItems:", favoriteItems);

  // Logs the current search terms for debugging purposes.
  console.log("searchArray", searchArray);

  /**
   * Filters posts based on an array of search words.
   * Uses useCallback to memoize the function for performance optimization.
   *
   * @param {string[]} words - Array of words to filter posts by.
   */
  const filterPosts = useCallback(
    (words: string[]): void => {
      console.log("Filtering posts with words:", words);
      const newFilteredPosts = posts.filter((post) => {
        const title = (post.title || post.title?.rendered || "").toLowerCase();

        const isIncluded = words.some((word) =>
          title.includes(word.toLowerCase())
        );

        // Debug: Log each post's title and if it matches the filter
        console.log(`Post title: ${title}, Included in filter: ${isIncluded}`);

        return isIncluded;
      });

      console.log("Filtered posts:", newFilteredPosts);

      // Sets the filteredPosts state to only those posts whose titles contain
      // all of the search words.
      setFilteredPosts(newFilteredPosts);
    },
    [posts]
  );

  /**
   * Filters posts to show only those marked as favorites.
   * Uses useCallback to memoize the function for performance optimization.
   */
  const filterFavorites = useCallback(() => {
    // If there are favorite items, filters posts to those with IDs
    // in the favoriteItems array. Otherwise, resets to the original posts.
    console.log("Filtering favorites");

    const newFilteredPosts =
      favoriteItems.length > 0
        ? posts.filter((post) => favoriteItems.includes(post.id))
        : posts;

    // Debug: Log the filtered posts after applying favorites filter
    console.log("Filtered posts after applying favorites:", newFilteredPosts);

    if (searchArray.length === 0) setFilteredPosts(newFilteredPosts);
  }, [searchArray, favoriteItems, posts]);

  // Effect hook to apply the favorite filter on component mount and
  // whenever favoriteItems changes.
  useEffect(() => {
    filterFavorites();
  }, [filterFavorites]);

  // Effect hook to apply the search filter whenever the searchArray or posts change.
  useEffect(() => {
    // If the search array is empty, resets the filteredPosts to the original posts.
    // if (searchArray.length === 0) {
    //   console.log("Resetting posts due to empty search array");

    //   setFilteredPosts(posts);
    //   return;
    // }

    // Calls filterPosts to filter based on the searchArray.
    filterPosts(searchArray);
  }, [posts, searchArray, filterPosts]);

  // Returns the filteredPosts state and the filterPosts function.
  return { filteredPosts, filterPosts };
};

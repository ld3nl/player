import { useEffect, useState, useCallback } from "react";
import { homePost, Category } from "@/lib/types";

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

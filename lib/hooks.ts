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

// Type definition for Category
type Category = {
  id: number;
  name: string;
  slug: string;
};

// Type definition for Post
type Post = {
  id: number;
  imageUrl: string;
  audioUrl: string;
  title: string | { rendered: string }; // Updated to use a union type
  date: string;
  categories: Category[];
  link: string;
};

export const useFilteredPosts = (
  posts: Post[],
  favoriteItems: number[],
  searchArray: string[],
  categoryIds: number[],
) => {
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(() => posts);
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
        post.categories.some((category) => categoryIds.includes(category.id)),
      );
    }

    if (searchArray.length > 0) {
      newFilteredPosts = newFilteredPosts.filter((post) => {
        const titleString =
          typeof post.title === "string" ? post.title : post.title.rendered;
        return searchArray.some((word) =>
          titleString.toLowerCase().includes(word.toLowerCase()),
        );
      });
    }

    return newFilteredPosts;
  }, [posts, favoriteItems, categoryIds, searchArray]);

  // Exposing a function that can be used to manually trigger filtering
  const filterPosts = () => {
    const newFilteredPosts = performFiltering();

    const flattenedAndUniqueIds = Array.from(
      new Set(
        newFilteredPosts.flatMap((post) =>
          post.categories.map((cat) => cat.id),
        ),
      ),
    );

    setFilteredPostsCategory(flattenedAndUniqueIds);

    setFilteredPosts(newFilteredPosts);
  };

  return { filteredPosts, filterPosts, filteredPostsCategory };
};

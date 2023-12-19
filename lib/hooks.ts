import { useEffect, useState, useCallback } from "react";

export const useLockScroll = (isOpen: boolean): void => {
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (isOpen) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
      }
    };

    // Add listeners to lock scroll
    if (isOpen && typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("keydown", handleKeyDown);
    }

    // Remove listeners to unlock scroll
    return () => {
      document.body.style.overflow = "visible";
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);
};

export default useLockScroll;

type Post = {
  id: any;
  audioUrl: any;
  title: any;
  date: string;
};

export const useFilteredPosts = (posts: Post[], favoriteItems: number[]) => {
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);

  const filterPosts = (words: string[]): void => {
    setFilteredPosts(
      posts.filter((post) => {
        const title =
          post.title.toLowerCase() || post.title?.rendered?.toLowerCase();
        return (
          words.length > 0 &&
          words.every(
            (word) =>
              typeof word === "string" && title.includes(word.toLowerCase())
          )
        );
      })
    );
  };

  const filterFavorites = useCallback(() => {
    if (favoriteItems.length > 0) {
      setFilteredPosts(posts.filter((post) => favoriteItems.includes(post.id)));
    } else {
      setFilteredPosts(posts);
    }
  }, [favoriteItems, posts]);

  useEffect(() => {
    filterFavorites();
  }, [filterFavorites]);

  return { filteredPosts, filterPosts };
};

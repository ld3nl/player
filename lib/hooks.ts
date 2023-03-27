import { useEffect } from "react";

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

import React, { useEffect, useRef, useState } from "react"; // Import React and its hooks
import Button from "@/components/Button/Button"; // Button component for interactions
// import Icon from "@/components/Icon/Icon"; // Icon component for rendering SVG icons
import he from "he"; // Library for decoding HTML entities
import debounce from "lodash/debounce"; // Debounce function to limit the rate of function calls

import {
  Heart,
} from "@phosphor-icons/react";

import { HeaderProps, SVGIconName } from "@/lib/types"; // Types for props and SVG icons
import { DEFAULT_NUMBER_OF_POSTS } from "@/lib/constants"; // Default constants

/**
 * Header Component
 *
 * Manages the top section of the application, including:
 * - Post filtering (search and category selection)
 * - Number of posts to display
 * - Toggle for favorite items
 */
const Header: React.FC<HeaderProps> = ({
  totalPosts,
  numberOfPosts,
  setNumberOfPosts,
  handleSearchChange,
  handleCategoryChange,
  toggleFavorites,
  showFav,
  filteredCategoryList,
}) => {
  // Ref to track the height of the header element for scroll calculations
  const elementRef = useRef<HTMLDivElement>(null);

  // State to manage whether the header is scrolled and whether it should be hidden
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrolledAndHide, setIsScrolledAndHide] = useState(false);

  // Track the height of the header to handle scrolling behavior
  const [height, setHeight] = useState(0);

  /**
   * Handle number of posts input change.
   * Updates the number of posts displayed when the input is changed.
   */
  const handleNumberOfPostsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setNumberOfPosts(Number(e.target.value)); // Update the number of posts based on input value
  };

  // Effect: Set the height of the header element on mount and when window resizes
  useEffect(() => {
    if (elementRef.current) {
      setHeight(elementRef.current.offsetHeight); // Set initial header height
    }

    const handleResize = () => {
      if (elementRef.current) {
        setHeight(elementRef.current.offsetHeight); // Update height on resize
      }
    };

    const debouncedHandleResize = debounce(handleResize, 100); // Debounce resize handler to avoid excessive updates

    // Add resize event listener
    window.addEventListener("resize", debouncedHandleResize);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener("resize", debouncedHandleResize);
  }, []);

  // Effect: Handle scrolling behavior to show/hide the header based on scroll position
  useEffect(() => {
    let lastScrollY = window.scrollY; // Track last scroll position

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY > lastScrollY; // Determine if scrolling up
      const notAtBottom =
        window.innerHeight + window.scrollY <
        document.documentElement.scrollHeight - 50; // Check if not scrolled to the bottom

      if (notAtBottom) {
        setIsScrolledAndHide(scrollingUp && currentScrollY > height * 5); // Hide header when scrolling up beyond 5x height
        setIsScrolled(currentScrollY > height); // Set header as scrolled once past its height
      }

      lastScrollY = currentScrollY; // Update last scroll position
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up the scroll event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [height]); // Re-run effect when height changes

  /**
   * Handle search input change with debounce.
   * Debounces the search input to limit how often the search function is called.
   */
  const debouncedSearch = debounce(
    // eslint-disable-next-line no-unused-vars
    (searchTerms: string[], filterCallback: (terms: string[]) => void) => {
      filterCallback(searchTerms);
    },
    500,
  );

  const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchString = e.target.value.trim();
    const searchTerms = searchString.split(" ").filter(Boolean); // Split and filter out empty search terms
    debouncedSearch(searchTerms, handleSearchChange); // Debounced search handling
  };

  /**
   * Handle category change.
   * Triggers when a new category is selected from the dropdown.
   */
  const categoryChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory =
      e.target.value === "all" ? [] : [Number(e.target.value)]; // If "all" is selected, set an empty array
    handleCategoryChange(newCategory); // Update category filter
  };

  return (
    <div
      ref={elementRef} // Reference for getting the height of the header
      className={[
        "sticky z-50 flex flex-col p-3 md:flex-row", // Header styling and layout
        "duration-600 transition-all ease-in-out", // Smooth transition effects
        isScrolledAndHide ? "-top-full" : "top-0", // Hide header if scrolled and conditions met
        isScrolled
          ? "bg-white/50 shadow-lg backdrop-blur-sm backdrop-filter" // Add background and shadow when scrolled
          : "bg-gray-200", // Default background when not scrolled
      ].join(" ")}
    >
      {/* Input for selecting the number of posts to display */}
      <div className="mx-3 flex flex-col">
        <label htmlFor="numberOfPosts" className="text-gray-700">
          <span className="hidden md:inline">Number of posts:</span>
          <span className="md:hidden">Posts:</span>
        </label>
        <input
          className="form-input mt-1 block w-full md:w-20"
          id="numberOfPosts"
          type="number"
          step="30"
          max={totalPosts}
          min={DEFAULT_NUMBER_OF_POSTS}
          value={numberOfPosts}
          onChange={handleNumberOfPostsChange}
        />
      </div>

      {/* Search Input */}
      <div className="mx-3 mt-3 flex flex-col md:mt-0">
        <label htmlFor="search" className="text-gray-700">
          Search:
        </label>
        <input
          className="form-input mt-1 block w-full"
          id="search"
          type="text"
          placeholder="Search"
          onChange={searchHandler} // Trigger search handler on input change
        />
      </div>

      {/* Categories Select */}
      <div className="mx-3 mt-3 flex flex-col md:mt-0">
        <label htmlFor="categories" className="text-gray-700">
          Categories:
        </label>
        <select
          id="categories"
          className="form-input mt-1 block w-full"
          onChange={categoryChangeHandler} // Trigger category change handler
          aria-label="Categories"
        >
          <option value="all">All</option>
          {filteredCategoryList.filter(Boolean).map((category, index) => {
            const { name, id } = category;
            return (
              <option key={`category-${id}-${index}`} value={id}>
                {he.decode(name)} {/* Decode category names for display */}
              </option>
            );
          })}
        </select>
      </div>

      {/* Favorites Toggle Button */}
      <div className="mx-3 mt-3 flex justify-center md:mt-0">
        {/* Button to toggle favorite items */}
        <Button
          className="form-input relative mt-auto flex w-full items-center justify-center"
          onClick={toggleFavorites} // Toggle favorite items when clicked
          aria-pressed={showFav} // ARIA attribute for accessibility
          ariaLabel={!showFav ? "Show Favorite Items" : "Show All Items"} // ARIA label for screen readers
        >
          {/* <Icon
            className="absolute left-0"
            name={SVGIconName.Favorite}
            size="sm"
            variation={showFav ? "active" : "default"}
            customVariation={{
              active: "fill-purple-600",
              default: "fill-white stroke-purple-600 stroke-2",
            }}
          /> */}
          <Heart
            size={24}
            className="flex size-6"
            color={"var(--color-purple-600)"}
            weight={showFav ? "fill" : "thin"}
          />
          <span>{!showFav ? "Show Favorite Items" : "Show All Items"}</span>
        </Button>
      </div>
    </div>
  );
};

export default Header;

/**
 * Possible Refactoring Ideas:
 * 1. **Memoization**: Consider memoizing expensive operations like `filteredCategoryList.filter` or debounced functions to avoid unnecessary recalculations.
 * 2. **Accessibility Improvements**: Add more ARIA attributes to ensure better keyboard navigation and screen reader compatibility.
 * 3. **TypeScript Enhancements**: Strengthen type safety, especially for callback functions like `handleSearchChange` and `handleCategoryChange`.
 * 4. **Performance Optimization**: Use `useTransition` for smoother transitions when interacting with the search or category filters.
 * 5. **Lazy Loading**: If certain sections of the header are less frequently used (like categories), consider lazy loading them to optimize initial load performance.
 */

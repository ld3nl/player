import React, { useEffect, useRef, useState } from "react";
import Button from "@/components/Button/Button";
import Icon from "@/components/Icon/Icon";
import he from "he";
import debounce from "debounce";

const DEFAULT_NUMBER_OF_POSTS = 30;

interface Category {
  id: number;
  name: string;
}

interface HeaderProps {
  totalPosts: number;
  numberOfPosts: number;
  setNumberOfPosts: React.Dispatch<React.SetStateAction<number>>;
  handleSearchChange: React.Dispatch<React.SetStateAction<string[]>>;
  handleCategoryChange: React.Dispatch<React.SetStateAction<number[]>>;
  toggleFavorites: () => void;
  showFav: boolean;
  filteredCategoryList: Category[];
}

// const noop = () => {}; // Default no-operation function

// Header component to manage the top section of the application
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
  const elementRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrolledAndHide, setIsScrolledAndHide] = useState(false);
  const [height, setHeight] = useState(0);

  // Function to handle the change of the number of posts
  const handleNumberOfPostsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setNumberOfPosts(Number(e.target.value));
  };

  useEffect(() => {
    // Make sure the element is not null
    if (elementRef.current) {
      setHeight(elementRef.current.offsetHeight);
    }

    const handleResize = () => {
      if (elementRef.current) {
        setHeight(elementRef.current.offsetHeight);
      }
    };

    const debouncedHandleResize = debounce(handleResize, 100); // Debouncing with 100ms delay

    // Add event listener for window resize
    window.addEventListener("resize", debouncedHandleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", debouncedHandleResize);
  }, []);

  // Set up the event listener for scrolling
  useEffect(() => {
    let lastScrollY = window.scrollY; // Track the last scroll position

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY > lastScrollY; // Corrected the logic here

      // Using document.documentElement.scrollHeight to get the total content height
      const notAtBottom =
        window.innerHeight + window.scrollY <
        document.documentElement.scrollHeight - 50; // Adding a threshold to account for iOS bounce

      if (notAtBottom) {
        setIsScrolledAndHide(scrollingUp && currentScrollY > height * 5);
        setIsScrolled(currentScrollY > height);
      }

      console.log(
        "scrollingUp && currentScrollY > height * 5",
        scrollingUp && currentScrollY > height * 5,
        currentScrollY,
        ">",
        height * 5,
      );

      lastScrollY = currentScrollY; // Update the last scroll position
    };

    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [height, setIsScrolledAndHide, setIsScrolled]); // Ensure all used states and props are in dependency array

  const debouncedSearch = debounce(
    (searchTerms: string[], filterCallback: Function) => {
      filterCallback(searchTerms);
    },
    500,
  ); // 500 ms delay

  const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchString = e.target.value.trim();
    const searchTerms = searchString.split(" ").filter(Boolean);
    console.log(searchTerms);
    debouncedSearch(searchTerms, () => {
      // Directly filter and set categories based on search terms
      handleSearchChange(searchTerms);
    });
  };

  const categoryChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory =
      e.target.value === "all" ? [] : [Number(e.target.value)];

    handleCategoryChange(newCategory);
  };

  return (
    <div
      ref={elementRef}
      className={[
        "sticky z-50 flex flex-col p-3 md:flex-row",
        "duration-600 transition-all ease-in-out",
        isScrolledAndHide ? "-top-full" : "top-0",
        isScrolled
          ? "bg-white/50 shadow-lg backdrop-blur-sm backdrop-filter"
          : "bg-gray-200",
      ].join(" ")}
    >
      {/* Input for selecting the number of posts */}
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
          onChange={searchHandler}
        />
      </div>

      {/* Categories Select */}
      <div className="mx-3 mt-3 flex flex-col md:mt-0">
        <label htmlFor="search" className="text-gray-700">
          Categories:
        </label>
        <select
          className="form-input mt-1 block w-full"
          onChange={categoryChangeHandler}
        >
          <option value="all">All</option>
          {filteredCategoryList.map(({ name, id }, index) => (
            <option key={`category-${id}-${index}`} value={id}>
              {he.decode(name)}
            </option>
          ))}
        </select>
      </div>

      {/* Favorites Toggle Button */}
      <div className="mx-3 mt-3 flex justify-center md:mt-0">
        {/* Button to toggle favorite items */}
        <Button
          className="form-input relative mt-auto flex w-full items-center justify-center"
          onClick={toggleFavorites}
          aria-pressed={showFav}
        >
          <Icon
            className="absolute left-0"
            name="Favorite"
            size="sm"
            variation={showFav ? "active" : "default"}
            customVariation={{
              active: "fill-purple-600",
              default: "fill-white stroke-purple-600 stroke-2",
            }}
          />
          <span>{!showFav ? "Show Favorite Items" : "Show All Items"}</span>
        </Button>
      </div>
    </div>
  );
};

export default Header;

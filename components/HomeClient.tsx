"use client"; // Ensures this is a client-side component in Next.js

import {
  useEffect,
  useState,
  lazy,
  Suspense,
  useCallback,
  useMemo,
} from "react"; // React hooks for state and side effects
import { debounce } from "lodash"; // Utility to throttle search input
import AudioListing from "@/components/AudioListing/AudioListing"; // Component to display individual audio posts
const MainPlayer = lazy(() => import("@/components/MainPlayer/MainPlayer")); // Lazy load the MainPlayer component for better performance

import Header from "@/components/Header/Header"; // Header component for filtering, search, etc.
import Button from "@/components/Button/Button"; // Button component for interactions
import Icon from "@/components/Icon/Icon"; // Icon component for favorite button
import { SVGIconName } from "@/lib/types"; // SVG icon types

import { HomeProps, Modal, MediaState } from "@/lib/types"; // Type definitions for props and state

import { useFilteredPosts, useGetMediaState } from "@/lib/hooks"; // Custom hooks for managing media state and filtering posts

import { DEFAULT_NUMBER_OF_POSTS, DEFAULT_MODAL } from "@/lib/constants"; // Default constants

/**
 * Home Component: The main entry point for the homepage.
 * - Renders the list of audio posts.
 * - Handles filtering, search, favorites, and playback.
 * @param {HomeProps} props - The posts data, total number of posts, and categories.
 * @returns {JSX.Element} - The rendered Home page.
 */
export default function Home({
  posts,
  totalPosts,
  allCategories,
}: HomeProps): JSX.Element {
  // Custom hook to manage media playback states (e.g., isFavorite, playedSeconds, duration).
  const { mediaStates, updateMediaState, favoriteIds } = useGetMediaState();

  // Local state to manage loading UI.
  const [isLoading, setIsLoading] = useState(true);

  // Effect: Stops loading once mediaStates are ready.
  useEffect(() => {
    if (mediaStates) {
      setIsLoading(false); // Stop loading when mediaStates are available.
    }
  }, [mediaStates]); // Dependency: Re-run this effect when mediaStates change.

  // State: Controls the number of posts to display.
  const [numberOfPosts, setNumberOfPosts] = useState<number>(
    DEFAULT_NUMBER_OF_POSTS,
  );

  // State: Toggle to show only favorite items.
  const [showFav, setShowFav] = useState<boolean>(false);

  // State: Stores search terms for filtering posts.
  const [searchTerms, setSearchTerms] = useState<string[]>([]);

  // State: Stores selected category filters.
  const [filteredCategory, setFilteredCategory] = useState<number[]>([]);

  // State: Stores the modal state for displaying selected audio.
  const [modal, setModal] = useState<Modal>(DEFAULT_MODAL);

  // Custom hook to filter posts based on the current search, category, and favorite filters.
  const { filteredPosts, filterPosts } = useFilteredPosts(
    posts,
    showFav ? favoriteIds : [],
    searchTerms,
    filteredCategory,
  );

  // Effect: Updates filtered posts whenever the category, favorites, or search terms change.
  useEffect(() => {
    filterPosts(); // Triggers post filtering based on current state.
  }, [filterPosts, filteredCategory, showFav, searchTerms]); // Runs whenever these states change.

  // Function: Toggles between all posts and favorite posts.
  const toggleFavorites = useCallback(() => setShowFav((prev) => !prev), []);

  // Function: Resets modal state when the modal is closed.
  const closeModal = useCallback(() => setModal(DEFAULT_MODAL), []);

  // Use useMemo to properly handle debounce function
  const debouncedSearch = useMemo(
    () =>
      debounce((search: string[]) => {
        setSearchTerms(search); // Update search terms after debounce
      }, 300), // 300ms debounce delay
    [],
  );

  // Clean up the debounced search on component unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel(); // Cancel debounced function when component unmounts
    };
  }, [debouncedSearch]);

  // Handle search input changes with debounce
  const handleSearchChange = useCallback(
    (search: string[]) => {
      debouncedSearch(search); // Call the debounced search function
    },
    [debouncedSearch], // Add debouncedSearch as a dependency
  );

  // Function: Activates the modal and updates its state with selected post details.
  const modalFunction = useCallback(
    (post: any, currentItemState: MediaState) => {
      const { title, date, id, audioUrl, link } = post;

      // Set the modal state with the selected item's details.
      setModal({
        isModalActive: true,
        selectedItem: {
          title,
          date: date,
          link,
          src: `https://www.paullowe.org/wp-content/uploads/${audioUrl}`, // Full audio URL
          id: id,
          playedSeconds: currentItemState ? currentItemState.playedSeconds : 0, // Played seconds or default to 0
          duration: currentItemState ? currentItemState.duration : 0, // Duration or default to 0
          isFavorite: currentItemState ? currentItemState.isFavorite : false, // Favorite status or default to false
        },
      });
    },
    [setModal], // Dependencies: setModal to ensure it updates correctly
  );

  return (
    <>
      {/* Main layout wrapper */}
      <div className="flex h-full flex-col">
        {/* Header: Search, category filtering, and toggle favorites */}
        <Header
          totalPosts={totalPosts} // Total posts count for the header
          numberOfPosts={numberOfPosts} // Number of posts currently displayed
          setNumberOfPosts={setNumberOfPosts} // Function to set number of posts
          handleSearchChange={handleSearchChange} // Callback for handling search input
          handleCategoryChange={setFilteredCategory} // Callback for category filtering
          toggleFavorites={toggleFavorites} // Function to toggle the favorites filter
          showFav={showFav} // State controlling whether to show favorites
          filteredCategoryList={allCategories} // List of all categories for filtering
        />

        {/* Posts List */}
        <div className="border border-gray-600 bg-gray-700 text-white">
          {/* Conditional rendering: Show posts when not loading */}
          {!isLoading &&
            filteredPosts &&
            filteredPosts.slice(0, numberOfPosts).map((post) => {
              const { title, date, id, categories, link } = post;

              // Find the current media state for this post (or set defaults)
              const currentItem = mediaStates.find((val) => val.id === id) || {
                id,
                playedSeconds: 0,
                duration: 0,
                isFavorite: false,
              };

              const currentItemState = {
                id: currentItem.id,
                playedSeconds: currentItem.playedSeconds || 0,
                duration: currentItem.duration || 0,
                isFavorite: currentItem.isFavorite || false,
              };

              return (
                <AudioListing
                  key={`item-${id}`} // Unique key for each post
                  title={title} // Post title
                  date={date} // Post date
                  categories={categories} // Post categories
                  link={link} // Post link
                  playedSeconds={currentItemState.playedSeconds} // Played seconds of the audio
                  duration={currentItemState.duration} // Duration of the audio
                  setModalCallback={() => modalFunction(post, currentItemState)} // Function to open modal
                >
                  <Button
                    onClick={() => {
                      updateMediaState({
                        id: currentItemState.id,
                        playedSeconds: currentItemState.playedSeconds,
                        duration: currentItemState.duration,
                        isFavorite: !currentItemState.isFavorite,
                      });
                    }}
                    className="w-10"
                    ariaLabel="Favorite"
                  >
                    <Icon
                      className="me-2.5 size-3"
                      name={SVGIconName.Favorite}
                      size={"sm"}
                      variation={
                        currentItemState.isFavorite ? "active" : "default"
                      } // Change icon based on favorite status
                    />
                  </Button>
                </AudioListing>
              );
            })}
        </div>

        {/* Conditional rendering: Show MainPlayer when modal is active */}
        <Suspense fallback={<div>Loading...</div>}>
          {modal?.selectedItem && modal.selectedItem.id !== 0 && (
            <MainPlayer
              mediaItem={modal.selectedItem} // Pass the selected media item to the player
              closeModal={closeModal} // Function to close the modal
              stateCallback={(object) => {
                const { id, playedSeconds, duration, isFavorite } = object;
                updateMediaState({ id, playedSeconds, duration, isFavorite });
              }} // Callback for state changes
            />
          )}
        </Suspense>
      </div>
    </>
  );
}

/**
 * Possible Refactoring Ideas:
 * 1. **Lazy Loading Components**: Lazy load additional components like `Header` and `AudioListing` to further optimize performance.
 * 2. **Error Handling**: Implement better error handling for when posts fail to load, and show fallback content or error messages.
 * 3. **React Query or SWR**: Replace custom hooks for filtering and search with React Query or SWR for more robust state and cache management.
 * 4. **Accessibility**: Enhance accessibility by ensuring all interactive elements, such as buttons and icons, have appropriate ARIA labels.
 */

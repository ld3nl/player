"use client"; // Ensures this is a client-side component

import { useEffect, useState, lazy, Suspense, useCallback } from "react";

import { debounce } from "lodash";

import AudioListing from "@/components/AudioListing/AudioListing";
// import MainPlayer from "@/components/MainPlayer/MainPlayer";
const MainPlayer = lazy(() => import("@/components/MainPlayer/MainPlayer"));

import Header from "@/components/Header/Header";
import Button from "@/components/Button/Button";
import Icon from "@/components/Icon/Icon";
import { SVGIconName } from "@/lib/types";

import { HomeProps, Category, Modal, MediaState } from "@/lib/types";

import { useFilteredPosts, useGetMediaState } from "@/lib/hooks";

import { DEFAULT_NUMBER_OF_POSTS, DEFAULT_MODAL } from "@/lib/constants";

/**
 * Home Component: The main entry point for the application.
 * - Renders the list of audio posts
 * - Handles filtering, search, favorites, and playback.
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
      setIsLoading(false); // Update loading state once media states are available.
    }
  }, [mediaStates]); // Dependency: Re-run this effect when mediaStates changes.

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

  // State: Stores the list of filtered categories.
  const [filteredCategoryList, setFilteredPostsCategory] =
    useState<Category[]>(allCategories);

  // Custom hook to filter posts based on the current search, category, and favorite filters.
  const {
    filteredPosts,
    // filteredPostsCategory,
    filterPosts,
  } = useFilteredPosts(
    posts,
    showFav ? favoriteIds : [],
    searchTerms,
    filteredCategory,
  );

  // Effect: Updates filtered posts whenever the category, favorites, or search terms change.
  useEffect(() => {
    // Reset to show all categories if no specific category is selected.
    if (filteredCategory.length === 0) {
      setFilteredPostsCategory(allCategories);
    }

    // // Filter the categories based on user selections.
    // const filteredCategories: Category[] = allCategories.filter(
    //   (category) => category?.id && filteredPostsCategory.includes(category.id),
    // );

    filterPosts(); // Triggers post filtering based on current state.
  }, [filteredCategory, showFav, searchTerms]); // Runs whenever these states change.

  // Function: Toggles between all posts and favorite posts.
  const toggleFavorites = useCallback(() => setShowFav((prev) => !prev), []);

  // Function: Resets modal state when the modal is closed.
  const closeModal = useCallback(() => setModal(DEFAULT_MODAL), []);

  const handleSearchChange = useCallback(
    debounce((search: string[]) => setSearchTerms(search), 300),
    [],
  );

  // Function: Activates the modal and updates its state.
  const modalFunction = useCallback(
    (post: any, currentItemState: MediaState) => {
      const { title, date, id, audioUrl } = post;

      // Set the modal state with the selected item's details.
      setModal({
        isModalActive: true,
        selectedItem: {
          title,
          date: date,
          src: `https://www.paullowe.org/wp-content/uploads/${audioUrl}`, // Full audio URL.
          id: id,
          playedSeconds: currentItemState ? currentItemState.playedSeconds : 0, // Default to 0 if no state.
          duration: currentItemState ? currentItemState.duration : 0, // Default to 0 if no state.
          isFavorite: currentItemState ? currentItemState.isFavorite : false, // Default to false if no state.
        },
      });
    },
    [],
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
          filteredCategoryList={filteredCategoryList} // List of filtered categories
        />

        {/* Posts List */}
        <div className="border border-gray-600 bg-gray-700 text-white">
          {/* Conditional rendering: Show posts when not loading */}
          {!isLoading &&
            filteredPosts &&
            filteredPosts.slice(0, numberOfPosts).map((post) => {
              const {
                // audioUrl,
                title,
                date,
                id,
                categories,
                link,
                // imageUrl
              } = post;

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

              // Determine if the current item is marked as a favorite.
              const isFavorite = mediaStates.some(
                (val) => val.id === id && val.isFavorite,
              );

              return (
                <AudioListing
                  key={`item-${id}`} // Unique key for each item
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
                      updateMediaState(
                        currentItemState.id,
                        currentItemState.playedSeconds,
                        currentItemState.duration,
                        !currentItemState.isFavorite,
                      );
                    }}
                    className="w-10"
                    ariaLabel="Favorite"
                  >
                    <Icon
                      className="me-2.5 size-3"
                      name={SVGIconName.Favorite}
                      size={"sm"}
                      variation={isFavorite ? "active" : "default"} // Changes icon based on favorite status
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
              // setGlobalMediaState={updateMediaState} // Function to update global media state
              closeModal={closeModal} // Function to close the modal
              stateCallback={(object) => {
                const { id, playedSeconds, duration, isFavorite } = object;
                updateMediaState(id, playedSeconds, duration, isFavorite);
              }} // Callback for state changes
            />
          )}
        </Suspense>
      </div>
    </>
  );
}

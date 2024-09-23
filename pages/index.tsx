import { useEffect, useState, lazy, Suspense, useCallback } from "react";
import { GetStaticProps } from "next";
import LRUCache from "lru-cache";
import Head from "next/head";
import { debounce } from "lodash";

import AudioListing from "@/components/AudioListing/AudioListing";
// import MainPlayer from "@/components/MainPlayer/MainPlayer";
const MainPlayer = lazy(() => import("@/components/MainPlayer/MainPlayer"));

import Header from "@/components/Header/Header";
import Button from "@/components/Button/Button";
import Icon from "@/components/Icon/Icon";
import { SVGIconName } from "@/lib/types";

import { HomeProps, Category, Modal } from "@/lib/types";

import {
  getAllPostsFromServer,
  getCategoryCount,
  StaticCategoryData,
} from "../lib/utils";
import { useFilteredPosts, useGetMediaState } from "@/lib/hooks";

import { DEFAULT_NUMBER_OF_POSTS } from "@/lib/constants";

// Modal default state, used to reset modal when closing.
const DEFAULT_MODAL: Modal = {
  isModalActive: false,
  selectedItem: {
    title: "",
    date: "",
    src: "",
    id: 0,
    playedSeconds: 0,
    duration: 0,
    isFavorite: false,
  },
};

// Initializing LRUCache to store fetched data. This improves performance by reducing redundant requests.
const cache = new LRUCache<string, HomeProps>({
  max: 500, // maximum number of entries in the cache
});

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
      console.log(mediaStates); // Debugging: Logs current media states.
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

  // Effect: Debugging modal state changes (could be removed in production).
  useEffect(() => {
    console.log(modal);
  }, [modal]);

  // State: Stores the list of filtered categories.
  const [filteredCategoryList, setFilteredPostsCategory] =
    useState<Category[]>(allCategories);

  // Custom hook to filter posts based on the current search, category, and favorite filters.
  const { filteredPosts, filteredPostsCategory, filterPosts } =
    useFilteredPosts(
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

    // Filter the categories based on user selections.
    const filteredCategories: Category[] = allCategories.filter(
      (category) => category?.id && filteredPostsCategory.includes(category.id),
    );

    console.log(filteredCategories); // Debugging: Logs filtered categories.

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

  return (
    <>
      {/* Head Section: SEO and meta tags for the page */}
      <Head>
        <title>Paul Lowe Talks source https://www.paullowe.org</title>
        <meta name="description" content="Paul Lowe Talks" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
              const { audioUrl, title, date, id, categories, link, imageUrl } =
                post;

              // Find the current item in the mediaStates array based on ID.
              const currentItem = mediaStates.filter((val) => val.id === id);

              // Determine if the current item is marked as a favorite.
              const isFavorite = mediaStates.some(
                (val) => val.id === id && val.isFavorite,
              );

              // Default state for the current item (if no matching item found).
              let currentItemState = {
                id: id,
                playedSeconds: 0,
                duration: 0,
                isFavorite: false,
              };

              // Update currentItemState if a match is found in mediaStates.
              if (currentItem.length) {
                currentItemState = {
                  id: currentItem[0].id,
                  playedSeconds: currentItem[0].playedSeconds,
                  duration: currentItem[0].duration,
                  isFavorite: currentItem[0].isFavorite, // Toggle favorite status.
                };
              }

              // Function: Activates the modal and updates its state.
              const modalFunction = () => {
                console.log("Modal @", {
                  selectedItem: {
                    title,
                    date: date,
                    src: imageUrl,
                    id: id,
                    playedSeconds: currentItemState.playedSeconds,
                    duration: currentItemState.duration,
                    isFavorite: currentItemState.isFavorite,
                  },
                });

                // Set the modal state with the selected item's details.
                setModal({
                  isModalActive: true,
                  selectedItem: {
                    title,
                    date: date,
                    src: `https://www.paullowe.org/wp-content/uploads/${audioUrl}`, // Full audio URL.
                    id: id,
                    playedSeconds: currentItemState
                      ? currentItemState.playedSeconds
                      : 0, // Default to 0 if no state.
                    duration: currentItemState ? currentItemState.duration : 0, // Default to 0 if no state.
                    isFavorite: currentItemState
                      ? currentItemState.isFavorite
                      : false, // Default to false if no state.
                  },
                });
              };

              return (
                <AudioListing
                  key={`item-${id}`} // Unique key for each item
                  title={title} // Post title
                  date={date} // Post date
                  categories={categories} // Post categories
                  link={link} // Post link
                  playedSeconds={currentItemState.playedSeconds} // Played seconds of the audio
                  duration={currentItemState.duration} // Duration of the audio
                  setModalCallback={modalFunction} // Function to open modal
                >
                  <Button
                    onClick={() => {
                      console.log(
                        "Play button clicked for item:",
                        id,
                        !currentItemState.isFavorite,
                        currentItem.length,
                      );
                      updateMediaState(
                        currentItemState.id,
                        currentItemState.playedSeconds,
                        currentItemState.duration,
                        !currentItemState.isFavorite,
                      );
                    }}
                    className="w-10"
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

/**
 * Calculates the dynamic Time To Live (TTL) for cache entries.
 * @return {number} The TTL value in seconds.
 */
function calculateDynamicTTL() {
  let ttl = 3600; // Default TTL set to 1 hour (3600 seconds).
  return ttl;
}

/**
 * Dynamically calculates the revalidate time based on content update frequency or other criteria.
 * @return {number} The revalidate time in seconds.
 */
function calculateRevalidateTime() {
  const defaultRevalidateTime = 7000; // Default revalidate time set to 7000 seconds.
  return defaultRevalidateTime;
}

// getStaticProps: Fetches data at build time, caching it for better performance.
export const getStaticProps: GetStaticProps = async () => {
  console.log("[getStaticProps] Function called"); // Debugging: Logs when function is called.

  const key = "posts"; // Cache key to retrieve/store data.
  console.log(`[getStaticProps] Cache key: ${key}`);

  // Try to retrieve cached data using the key.
  const cachedData = cache.get(key);
  console.log(
    `[getStaticProps] Cache get for key: ${key}, found: ${!!cachedData}`,
  );

  // Return cached data if available.
  if (cachedData) {
    console.log(`[getStaticProps] Cache hit for key: ${key}`);
    return { props: cachedData };
  }

  // Fetch new data if not cached.
  const categoriesCount = await getCategoryCount(80);
  console.log(`[getStaticProps] Categories count: ${categoriesCount}`);

  const totalPosts = categoriesCount;

  // Number of requests required to fetch all posts (99 per request).
  const numberOfRequests = Math.ceil(totalPosts / 99);
  console.log(
    `[getStaticProps] Number of requests to make: ${numberOfRequests}`,
  );

  const allCategories = StaticCategoryData.flatMap(({ name, id, slug }) => {
    const cleanedNames = name.replace(/\s*\/\s*/g, "/").split("/");
    return cleanedNames.map((partName) => ({
      name: partName,
      id,
      slug,
    }));
  });
  const promises = [];

  // Creating a series of promises to fetch posts in batches.
  for (let i = 0; i < numberOfRequests; i++) {
    const offset = i * 99;
    promises.push(getAllPostsFromServer(80, 99, offset));
    console.log(`[getStaticProps] Request added for batch: ${i + 1}`);
  }

  const postsFromServer = await Promise.all(promises).then((results) => {
    console.log(`[getStaticProps] Received data from all batches`);
    return results
      .flat()
      .map(({ excerpt, title, date, id, categories, link, content }) => {
        const pattern = /src="([^"]*)/;
        const match = excerpt.rendered.match(pattern);
        const audioUrl = match
          ? match[1].replace(
              /^(https?:\/\/)?(www\.)?paullowe\.org\/wp-content\/uploads\//,
              "",
            )
          : "";

        const imagePattern = /src="([^"]+\.(jpg|jpeg|png|gif))"/;
        const imageMatch = content.rendered.match(imagePattern);
        const imageUrl = imageMatch
          ? imageMatch[1].replace(
              /^(https?:\/\/)?(www\.)?paullowe\.org\/wp-content\/uploads\//,
              "",
            )
          : "";

        const categoryDetails = categories
          ?.map((categoryId: number) => {
            if (categoryId !== 80) {
              return StaticCategoryData.find(
                (category: Category) => category?.id === categoryId,
              );
            }
          })
          .filter((category): category is Category => !!category);

        return {
          id,
          imageUrl,
          audioUrl: audioUrl,
          title: title.rendered,
          date,
          categories: categoryDetails,
          link,
        };
      });
  });

  // Store the fetched data in cache for future use.
  const data = {
    posts: postsFromServer,
    totalPosts,
    allCategories,
  };

  // Cache the data for later use and set a TTL.
  cache.set(key, { ...data }, { ttl: calculateDynamicTTL() });
  console.log(
    `[getStaticProps] Cache miss for key: ${key}, storing data in cache with TTL: ${calculateDynamicTTL()} seconds`,
  );

  const revalidateTime = calculateRevalidateTime();
  console.log(
    `[getStaticProps] Returning data with revalidate time: ${revalidateTime} seconds`,
  );

  // Return the fetched data as props and set the revalidation time.
  return { props: data, revalidate: revalidateTime };
};

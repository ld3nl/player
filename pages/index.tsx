import { useEffect, useState } from "react";
import { GetStaticProps } from "next";
import LRUCache from "lru-cache";
import Head from "next/head";

import AudioListing from "@/components/AudioListing/AudioListing";
import MainPlayer from "@/components/MainPlayer/MainPlayer";
import Header from "@/components/Header/Header";
import Button from "@/components/Button/Button";
import Icon from "@/components/Icon/Icon";
import { SVGIconName } from "@/lib/types";

import { HomeProps, Category, SimpleCategory, Modal } from "@/lib/types";

import {
  getAllPostsFromServer,
  getCategoryCount,
  StaticCategoryData,
} from "../lib/utils";
import { useFilteredPosts, useGetMediaState } from "@/lib/hooks";

import { DEFAULT_NUMBER_OF_POSTS } from "@/lib/constants";

const cache = new LRUCache<string, HomeProps>({
  max: 500, // maximum number of entries
});

export default function Home({
  posts,
  totalPosts,
  allCategories,
}: HomeProps): JSX.Element {
  const { mediaStates, updateMediaState } = useGetMediaState();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (mediaStates) {
      console.log(mediaStates);
      setIsLoading(false);
    }
  }, [mediaStates]);

  const [numberOfPosts, setNumberOfPosts] = useState<number>(
    DEFAULT_NUMBER_OF_POSTS,
  );

  const [showFav, setShowFav] = useState<boolean>(false);
  const [favoriteItems, setFavoriteItems] = useState<number[]>([]);

  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [filteredCategory, setFilteredCategory] = useState<number[]>([]);

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

  const [modal, setModal] = useState<Modal>(DEFAULT_MODAL);

  useEffect(() => {
    console.log(modal);
  }, [modal]);

  const [filteredCategoryList, setFilteredPostsCategory] =
    useState<(SimpleCategory | null | undefined)[]>(allCategories);

  const { filteredPosts, filteredPostsCategory, filterPosts } =
    useFilteredPosts(
      posts,
      showFav ? favoriteItems : [],
      searchTerms,
      filteredCategory,
    );

  const updateFavoriteItemsFromStorage = () => {
    const storedFavorites = localStorage.getItem("favoriteItems");
    const parsedFavorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    setFavoriteItems(parsedFavorites);
  };

  useEffect(() => {
    updateFavoriteItemsFromStorage();
  }, [showFav]);

  useEffect(() => {
    if (filteredCategory.length === 0) {
      setFilteredPostsCategory(allCategories);
    }

    const filteredCategories: (Category | null | undefined)[] =
      allCategories.filter(
        (category: Category | null | undefined) =>
          category?.id && filteredPostsCategory.includes(category.id),
      );

    console.log(filteredCategories);

    filterPosts();
  }, [filteredCategory, showFav, searchTerms]); // This useEffect will run whenever filteredCategory changes

  const toggleFavorites = () => {
    setShowFav(!showFav);
    // Optionally trigger any additional logic when favorites are toggled
  };

  return (
    <>
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
      <div className="flex h-full flex-col">
        <Header
          totalPosts={totalPosts}
          numberOfPosts={numberOfPosts}
          setNumberOfPosts={setNumberOfPosts}
          handleSearchChange={setSearchTerms}
          handleCategoryChange={setFilteredCategory}
          toggleFavorites={toggleFavorites}
          showFav={showFav}
          filteredCategoryList={filteredCategoryList}
        />

        <div className="border border-gray-600 bg-gray-700 text-white">
          {!isLoading &&
            filteredPosts &&
            filteredPosts.slice(0, numberOfPosts).map((post) => {
              const { audioUrl, title, date, id, categories, link, imageUrl } =
                post;

              // Find the current item in the mediaStates array
              const currentItem = mediaStates.filter((val) => val.id === id);

              // Check if the current item is marked as a favorite
              const isFavorite = mediaStates.some(
                (val) => val.id === id && val.isFavorite,
              );

              // Initialize a default state for the current item
              let currentItemState = {
                id: 0,
                playedSeconds: 0,
                duration: 0,
                isFavorite: false,
              };

              // Check if there's a matching item in the mediaStates array
              if (currentItem.length) {
                // If a match is found, update currentItemState with the item's data
                currentItemState = {
                  id: currentItem[0].id,
                  playedSeconds: currentItem[0].playedSeconds,
                  duration: currentItem[0].duration,
                  isFavorite: !currentItem[0].isFavorite, // Note: This toggles the favorite status
                };
              }

              // Define a function to handle modal activation
              const modalFunction = () => {
                // Log the selected item details for debugging
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

                // Set the modal state to active and populate it with the selected item's data
                setModal({
                  isModalActive: true,
                  selectedItem: {
                    title,
                    date: date,
                    // Construct the full audio URL
                    src: `https://www.paullowe.org/wp-content/uploads/${audioUrl}`,
                    id: id,
                    playedSeconds: currentItemState.playedSeconds,
                    duration: currentItemState.duration,
                    isFavorite: currentItemState.isFavorite,
                  },
                });
              };
              return (
                <AudioListing
                  key={`item-${id}`}
                  title={title}
                  date={date}
                  favoriteCallback={updateFavoriteItemsFromStorage}
                  categories={categories}
                  link={link}
                  playedSeconds={currentItemState.playedSeconds}
                  duration={currentItemState.duration}
                  setModalCallback={modalFunction}
                >
                  <Button
                    onClick={() =>
                      updateMediaState(
                        currentItemState.id,
                        currentItemState.playedSeconds,
                        currentItemState.duration,
                        currentItemState.isFavorite,
                      )
                    }
                    className="w-10"
                  >
                    <Icon
                      className="me-2.5 size-3"
                      name={SVGIconName.Favorite}
                      size={"sm"}
                      variation={isFavorite ? "active" : "default"}
                    />
                  </Button>
                </AudioListing>
              );
            })}
        </div>
        {modal.selectedItem && (
          <MainPlayer
            mediaItem={modal.selectedItem}
            setGlobalMediaState={updateMediaState}
          />
        )}
      </div>
    </>
  );
}

/**
 * Calculates the dynamic Time To Live (TTL) for cache entries.
 * This is just an example and should be tailored to your application's needs.
 *
 * @return {number} The TTL value in seconds.
 */
function calculateDynamicTTL() {
  // Example logic: Set a default TTL and modify based on specific conditions
  let ttl = 3600; // default 1 hour in seconds

  // Example condition: Change TTL based on time of day, content type, etc.
  // if (someSpecificCondition) {
  //   ttl = 7200; // e.g., 2 hours in seconds
  // }

  return ttl;
}

/**
 * Dynamically calculates the revalidate time based on content update frequency or other criteria.
 * @return {number} The revalidate time in seconds.
 */
function calculateRevalidateTime() {
  // Example logic: Set a default revalidate time and adjust based on certain criteria
  const defaultRevalidateTime = 7000; // Default to 7000 seconds

  // Add logic here to determine the appropriate revalidate time.
  // This could be based on the time of day, the frequency of content updates, etc.

  return defaultRevalidateTime;
}

// Importing necessary types or functions from external libraries or frameworks.
export const getStaticProps: GetStaticProps = async () => {
  console.log("[getStaticProps] Function called"); // Log when function is called

  // Define a cache key to store or retrieve data.
  const key = "posts";
  console.log(`[getStaticProps] Cache key: ${key}`);

  // Attempt to retrieve cached data using the specified key.
  const cachedData = cache.get(key);
  console.log(
    `[getStaticProps] Cache get for key: ${key}, found: ${!!cachedData}`,
  );

  // Check if the data is already in the cache.
  if (cachedData) {
    console.log(`[getStaticProps] Cache hit for key: ${key}`);
    return { props: cachedData };
  }

  // Add a timestamp to see when data fetching starts.
  // console.log(
  //   `[getStaticProps] Starting data fetch at: ${new Date().toLocaleDateString(
  //     "en-AU",
  //   )}`,
  // );

  // Get the count of categories, which is used as an approximation for total posts.
  const categoriesCount = await getCategoryCount(80);
  console.log(`[getStaticProps] Categories count: ${categoriesCount}`);

  // Assuming that the total number of posts is equal to the number of categories.
  const totalPosts = categoriesCount;

  // Calculate the number of requests needed to fetch all posts, given a max of 99 per request.
  const numberOfRequests = Math.ceil(totalPosts / 99);
  console.log(
    `[getStaticProps] Number of requests to make: ${numberOfRequests}`,
  );

  const allCategories = StaticCategoryData.flatMap(({ name, id }) => {
    const cleanedNames = name.replace(/\s*\/\s*/g, "/").split("/");
    return cleanedNames.map((partName) => ({ name: partName, id }));
  });

  const promises = [];

  // Creating a series of promises to fetch posts in batches.
  for (let i = 0; i < numberOfRequests; i++) {
    const offset = i * 99;
    promises.push(getAllPostsFromServer(80, 99, offset));
    console.log(`[getStaticProps] Request added for batch: ${i + 1}`);
  }

  // Wait for all promises to resolve, then process the results.
  const postsFromServer = await Promise.all(promises).then((results) => {
    console.log(`[getStaticProps] Received data from all batches`);
    return results
      .flat()
      .map(({ excerpt, title, date, id, categories, link, content }) => {
        // Extracting the audio URL from the excerpt using a regular expression.
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
            if (categoryId !== 80)
              return StaticCategoryData.find(
                (category: Category | null | undefined) =>
                  category?.id === categoryId,
              );
          })
          .filter((category) => !!category && category.slug !== undefined); // Ensure `slug` is defined

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

  // Preparing the data to be returned and cached.
  const data = {
    posts: postsFromServer,
    totalPosts,
    allCategories,
  };

  // Storing the fetched data in cache to improve performance for subsequent requests.
  cache.set(key, { ...data }, { ttl: calculateDynamicTTL() });
  console.log(
    `[getStaticProps] Cache miss for key: ${key}, storing data in cache with TTL: ${calculateDynamicTTL()} seconds`,
  );

  // Returning the data as props to the page component and setting a revalidate time.
  const revalidateTime = calculateRevalidateTime();
  console.log(
    `[getStaticProps] Returning data with revalidate time: ${revalidateTime} seconds`,
  );

  return { props: data, revalidate: revalidateTime };
};

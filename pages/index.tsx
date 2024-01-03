import { useEffect, useState, useContext } from "react";
import { GetStaticProps } from "next";
import LRUCache from "lru-cache";
import Head from "next/head";
import he from "he"; // Importing he for HTML entity encoding/decoding

import AudioListing from "@/components/AudioListing/AudioListing";
import MainPlayer from "@/components/MainPlayer/MainPlayer";
import Icon from "@/components/Icon/Icon";
import Button from "@/components/Button/Button";

import {
  getAllPostsFromServer,
  getCategoryCount,
  StaticCategoryData,
} from "../lib/utils";
import { useFilteredPosts } from "../lib/hooks";

import { GlobalContext } from "./_app";

const debounce = (func: any, wait: any) => {
  let timeout: any;

  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

interface Category {
  id: number;
  name: string;
  // include other properties if there are any
}

type Post = {
  id: number;
  audioUrl: string;
  title: string;
  date: string;
  categories: any;
};

type HomeProps = {
  posts: Post[];
  totalPosts: number;
  allCategories: any;
};

const cache = new LRUCache<string, HomeProps>({
  max: 500, // maximum number of entries
});

const DEFAULT_NUMBER_OF_POSTS = 30;

export default function Home({
  posts,
  totalPosts,
  allCategories,
}: HomeProps): JSX.Element {
  const [numberOfPosts, setNumberOfPosts] = useState<number>(
    DEFAULT_NUMBER_OF_POSTS,
  );

  const [showFav, setShowFav] = useState<boolean>(false);
  const [favCTATriggered, setFavCTATriggered] = useState<boolean>(false);

  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [filteredCategory, setFilteredCategory] = useState<number[]>([]);

  const { globalContext } = useContext(GlobalContext);

  const [favoriteItems, setFavoriteItems] = useState<number[]>([]);

  const [filteredCategoryList, setFilteredPostsCategory] =
    useState<Category[]>(allCategories);

  const [isScrolled, setIsScrolled] = useState(false);

  const { filteredPosts, filteredPostsCategory, filterPosts } =
    useFilteredPosts(
      posts,
      showFav ? favoriteItems : [],
      searchTerms,
      filteredCategory,
    );

  // Set up the event listener for scrolling
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const updateFavorites = () => {
      const storedFavorites = localStorage.getItem("favoriteItems");
      const parsedFavorites = storedFavorites
        ? JSON.parse(storedFavorites)
        : [];

      if (JSON.stringify(favoriteItems) !== JSON.stringify(parsedFavorites)) {
        setFavoriteItems(parsedFavorites);
      }
    };

    updateFavorites();

    const storageListener = (event: any) => {
      if (event.key === "favoriteItems") {
        updateFavorites();
      }
    };

    window.addEventListener("storage", storageListener);

    return () => {
      window.removeEventListener("storage", storageListener);
    };
  }, [showFav, favCTATriggered, favoriteItems]);

  useEffect(() => {
    if (filteredCategory.length === 0) {
      setFilteredPostsCategory(allCategories);
    }

    filterPosts();
  }, [filteredCategory]); // This useEffect will run whenever filteredCategory changes

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop === 0) {
        window.scrollTo(0, 1);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Define the debounced search handler outside the component
  const debouncedSearch = debounce(
    (searchTerms: any, filterCallback: Function) => {
      filterCallback(searchTerms);
    },
    500,
  ); // 500 ms delay

  // Event handler for scroll event
  const handleScroll = () => {
    const top = window.scrollY < 10;
    setIsScrolled(!top);
  };

  // Input Handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchString = e.target.value.trim();
    const searchTerms = searchString.split(" ").filter(Boolean);
    setSearchTerms(searchTerms);

    // Use the debounced function
    if (searchTerms.length === 0) {
      setFilteredPostsCategory(allCategories);
    }

    debouncedSearch(searchTerms, () => {
      // Directly filter and set categories based on search terms
      const filteredCategories: Category[] = allCategories.filter(
        ({ id }: any) => filteredPostsCategory.includes(id),
      );

      console.log(filteredCategories);
      filterPosts();
    });
  };

  // Extracted event handler function
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory =
      e.target.value === "all" ? [] : [Number(e.target.value)];
    setFilteredCategory(newCategory);
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
        <div
          className={[
            "sticky top-0 z-50 flex flex-col p-3 md:flex-row",
            "transition duration-300 ease-in-out",
            isScrolled
              ? "bg-white/50 shadow-lg backdrop-blur-sm backdrop-filter"
              : "bg-gray-200",
          ].join(" ")}
        >
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
              defaultValue={numberOfPosts}
              onChange={(e) => setNumberOfPosts(Number(e.target.value))}
            />
          </div>
          <div className="mx-3 mt-3 flex flex-col md:mt-0">
            <label htmlFor="search" className="text-gray-700">
              <span className="hidden md:inline">Search:</span>
              <span className="md:hidden">Search:</span>
            </label>
            <input
              className="form-input mt-1 block w-full"
              id="search"
              type="text"
              placeholder="Search"
              onChange={handleSearchChange}
            />
          </div>

          <div className="mx-3 mt-3 flex flex-col md:mt-0">
            <label htmlFor="search" className="text-gray-700">
              <span>Categories:</span>
            </label>
            <select
              className="form-input mt-1 block w-full"
              onChange={handleCategoryChange}
            >
              <option value={"all"}>All</option>
              {filteredCategoryList.map(({ name, id }: any, index: number) => {
                return (
                  <option
                    key={`category-${id}-${index}`}
                    className="capitalize"
                    value={id}
                  >
                    {he.decode(name)}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="mx-3 mt-3 flex justify-center md:mt-0">
            <Button
              className="form-input relative mt-auto flex w-full items-center justify-center"
              onClick={() => {
                setShowFav(!showFav);
                filterPosts();
              }}
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
              <span>
                <span className="hidden md:inline">
                  {!showFav ? "Show Favorite Items" : "Show All Items"}
                </span>
                <span className="md:hidden">
                  {!showFav ? "Favorites" : "All Items"}
                </span>
              </span>
            </Button>
          </div>
        </div>

        <div className="border border-gray-600 bg-gray-700 text-white">
          {filteredPosts &&
            filteredPosts.slice(0, numberOfPosts).map((post, i) => {
              const { audioUrl, title, date, id, categories } = post;

              return (
                <AudioListing
                  key={`item-${i}`}
                  // @ts-ignore
                  title={title}
                  src={`https://www.paullowe.org/wp-content/uploads/${audioUrl}`}
                  date={date}
                  // @ts-ignore
                  id={id}
                  favoriteCallback={() => {
                    setFavCTATriggered(!favCTATriggered);
                  }}
                  categories={categories}
                />
              );
            })}
        </div>

        <MainPlayer {...globalContext.selectedItem} />
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
  console.log(
    `[getStaticProps] Starting data fetch at: ${new Date().toISOString()}`,
  );

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
    return results.flat().map(({ excerpt, title, date, id, categories }) => {
      // Extracting the audio URL from the excerpt using a regular expression.
      const pattern = /src="([^"]*)/;
      const match = excerpt.rendered.match(pattern);
      const audioUrl = match
        ? match[1].replace(
            /^(https?:\/\/)?(www\.)?paullowe\.org\/wp-content\/uploads\//,
            "",
          )
        : "";

      const categoryDetails = categories
        ?.map((categoryId: number) => {
          // Assuming you want to exclude category with id 80 and find the matching category
          if (categoryId === 80) {
            return null; // or however you want to handle this specific case
          }
          return StaticCategoryData.find(
            (category: any) => category.id === categoryId,
          );
        })
        .filter(Boolean); // This will remove any null values from the array

      return {
        id,
        audioUrl: audioUrl,
        title: title.rendered,
        date,
        categories: categoryDetails,
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

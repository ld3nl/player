import { useEffect, useState, useContext } from "react";
import { GetStaticProps } from "next";
import LRUCache from "lru-cache";
import Head from "next/head";

import AudioListing from "@/components/AudioListing/AudioListing";
import MainPlayer from "@/components/MainPlayer/MainPlayer";
import Header from "@/components/Header/Header";

import {
  getAllPostsFromServer,
  getCategoryCount,
  StaticCategoryData,
} from "../lib/utils";
import { useFilteredPosts } from "../lib/hooks";

import { GlobalContext } from "./_app";

interface Category {
  id: number;
  name: string;
  // include other properties if there are any
}

type Post = {
  id: number;
  audioUrl: string;
  imageUrl: string;
  title: string;
  date: string;
  categories: any;
  link: string;
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
  const [favoriteItems, setFavoriteItems] = useState<number[]>([]);

  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [filteredCategory, setFilteredCategory] = useState<number[]>([]);

  const { globalContext } = useContext(GlobalContext);

  const [filteredCategoryList, setFilteredPostsCategory] =
    useState<Category[]>(allCategories);

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

    const filteredCategories: Category[] = allCategories.filter(({ id }: any) =>
      filteredPostsCategory.includes(id),
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
          {filteredPosts &&
            filteredPosts.slice(0, numberOfPosts).map((post) => {
              const { audioUrl, title, date, id, categories, link, imageUrl } =
                post;

              return (
                <AudioListing
                  key={`item-${id}`}
                  // @ts-ignore
                  title={title}
                  src={`https://www.paullowe.org/wp-content/uploads/${audioUrl}`}
                  date={date}
                  // @ts-ignore
                  id={id}
                  favoriteCallback={updateFavoriteItemsFromStorage}
                  categories={categories}
                  link={link}
                  imageSrc={imageUrl}
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

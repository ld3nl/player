import LRUCache from "lru-cache";
import {
  getAllPostsFromServer,
  getCategoryCount,
  StaticCategoryData,
} from "../utils";
import { HomeProps, Category } from "../types";

import { ROOT_CATEGORY_ID } from "../constants";

/**
 * Cache configuration:
 * - `max`: The maximum number of items to store in the cache.
 * - `ttl`: Time-to-live for cache entries (in milliseconds).
 * LRU (Least Recently Used) cache helps in improving performance by reducing redundant requests.
 */
const cache = new LRUCache<string, HomeProps>({
  max: 500, // Maximum number of cached entries.
  ttl: 1000 * 60 * 60, // 1-hour TTL (3600000 milliseconds).
});

/**
 * Helper function to calculate dynamic Time To Live (TTL) for cache entries.
 * Can be extended to return different TTL values based on content type, freshness requirements, etc.
 * @returns {number} TTL in seconds.
 */
function calculateDynamicTTL(): number {
  return 3600 * 1000; // Default TTL is 1 hour (3600000 milliseconds).
}

/**
 * Dynamically calculates the revalidate time based on content update frequency or other criteria.
 * @returns {number} The revalidate time in seconds.
 */
export function calculateRevalidateTime(): number {
  return 7000; // Default revalidate time set to 7000 seconds.
}
/**
 * Function to fetch all posts and associated metadata for the home page.
 * Utilizes caching to avoid redundant API calls and improve performance.
 * @returns {Promise<HomeProps>} The posts data and metadata required for rendering the homepage.
 */
export async function fetchPosts(): Promise<HomeProps> {
  const key = "posts"; // Cache key to retrieve/store data.

  // Attempt to fetch data from cache.
  const cachedData = cache.get(key);

  // If cached data exists, return it.
  if (cachedData) {
    console.log(`[fetchPosts] Cache hit for key: ${key}`);
    return cachedData;
  }

  // Fetch the total number of posts and categories count from server.
  const categoriesCount = await getCategoryCount(ROOT_CATEGORY_ID);
  const totalPosts = categoriesCount;

  // Calculate the number of API requests based on the total number of posts.
  const numberOfRequests = Math.ceil(totalPosts / 99);

  // Prepare to make requests for all posts in parallel.
  const promises: Promise<any>[] = [];
  // Use map to create promises for fetching posts in batches
  Array.from({ length: numberOfRequests }).map((_, i) => {
    const offset = i * 99;
    promises.push(getAllPostsFromServer(ROOT_CATEGORY_ID, 99, offset));
    console.log(`[fetchPosts] Request added for batch: ${i + 1}`);
  });

  // Fetch category details from static category data.
  const allCategories = StaticCategoryData.flatMap(({ name, id, slug }) => {
    // Some categories contain multiple parts split by "/". This splits and cleans them up.
    const cleanedNames = name.replace(/\s*\/\s*/g, "/").split("/");
    return cleanedNames.map((partName) => ({
      name: partName,
      id,
      slug,
    }));
  });

  // Await all promises to resolve and flatten the result array.
  const postsFromServer = await Promise.all(promises).then((results) =>
    results
      .flat()
      .map(({ excerpt, title, date, id, categories, link, content }) =>
        processPost({ excerpt, title, date, id, categories, link, content }),
      ),
  );

  // Prepare data to be cached.
  const data = {
    posts: postsFromServer,
    totalPosts,
    allCategories,
  };

  // Store the fetched data in the cache for future use.
  cache.set(key, data, { ttl: calculateDynamicTTL() });
  console.log(`[fetchPosts] Cache miss for key: ${key}. Data cached.`);

  // Return the fetched data.
  return data;
}

/**
 * Helper function to process individual posts. This can be expanded if necessary.
 */
function processPost({
  excerpt,
  title,
  date,
  id,
  categories,
  link,
  content,
}: any) {
  const audioPattern = /src="([^"]*)"/;
  const audioMatch = excerpt.rendered.match(audioPattern);
  const audioUrl = audioMatch
    ? audioMatch[1].replace(
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
      if (categoryId !== ROOT_CATEGORY_ID) {
        return StaticCategoryData.find(
          (category: Category) => category?.id === categoryId,
        );
      }
      return null;
    })
    .filter(Boolean);

  return {
    id,
    imageUrl,
    audioUrl,
    title: title.rendered,
    date,
    categories: categoryDetails,
    link,
  };
}

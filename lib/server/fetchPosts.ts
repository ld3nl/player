import LRUCache from "lru-cache"; // Importing LRUCache to manage in-memory caching for performance optimization
import {
  getAllPostsFromServer,
  getCategoryCount,
  StaticCategoryData,
} from "../utils"; // Utilities for fetching data and static categories
import { HomeProps, Category } from "../types"; // Type definitions for post properties and categories
import { ROOT_CATEGORY_ID } from "../constants"; // Constant for the root category ID

/**
 * Cache configuration:
 * - `max`: Maximum number of items to store in the cache.
 * - `ttl`: Time-to-live for cache entries (in milliseconds).
 * LRU (Least Recently Used) cache helps improve performance by reducing redundant requests.
 */
const cache = new LRUCache<string, HomeProps>({
  max: 500, // Maximum number of cached entries
  ttl: 1000 * 60 * 60, // 1-hour TTL (3600000 milliseconds)
});

/**
 * Helper function to calculate dynamic Time To Live (TTL) for cache entries.
 * Can be extended to return different TTL values based on content type, freshness requirements, etc.
 * @returns {number} TTL in milliseconds.
 */
function calculateDynamicTTL(): number {
  return 3600 * 1000; // Default TTL is 1 hour (3600000 milliseconds)
}

/**
 * Dynamically calculates the revalidate time based on content update frequency or other criteria.
 * @returns {number} The revalidate time in seconds.
 */
export function calculateRevalidateTime(): number {
  return 7000; // Default revalidate time set to 7000 seconds
}

/**
 * Function to fetch all posts and associated metadata for the home page.
 * Utilizes caching to avoid redundant API calls and improve performance.
 * @returns {Promise<HomeProps>} The posts data and metadata required for rendering the homepage.
 */
export async function fetchPosts(): Promise<HomeProps> {
  const key = "posts"; // Cache key for posts data

  // Attempt to retrieve data from the cache
  const cachedData = cache.get(key);

  // If cached data exists, return it
  if (cachedData) {
    console.log(`[fetchPosts] Cache hit for key: ${key}`);
    return cachedData;
  }

  // Fetch the total number of posts and categories count from the server
  const categoriesCount = await getCategoryCount(ROOT_CATEGORY_ID);
  const totalPosts = categoriesCount;

  // Calculate the number of API requests needed based on the total number of posts
  const numberOfRequests = Math.ceil(totalPosts / 99);

  // Prepare to fetch all posts in parallel using promises
  const promises: Promise<any>[] = [];
  Array.from({ length: numberOfRequests }).map((_, i) => {
    const offset = i * 99; // Offset to request batches of posts
    promises.push(getAllPostsFromServer(ROOT_CATEGORY_ID, 99, offset)); // Add promise to fetch each batch
    console.log(`[fetchPosts] Request added for batch: ${i + 1}`);
  });

  // Log all Vercel environment variables for debugging
  // console.log("Environment variables:", {
  //   VERCEL_URL: process.env.VERCEL_URL,
  //   NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
  //   NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
  //   VERCEL_ENV: process.env.VERCEL_ENV,
  //   VERCEL: process.env,
  //   // Add other environment variables here if necessary
  // });
  console.log("Base URL:", process.env.NEXT_PUBLIC_BASE_URL);
  console.log(
    "WordPress API Base URL:",
    process.env.NEXT_PUBLIC_WORDPRESS_API_BASE_URL,
  );
  console.log(
    "Fetching from API:",
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/posts`,
  );

  // Fetch static category details and clean up categories with multiple parts
  const allCategories = StaticCategoryData.flatMap(({ name, id, slug }) => {
    const cleanedNames = name.replace(/\s*\/\s*/g, "/").split("/"); // Clean category names
    return cleanedNames.map((partName) => ({
      name: partName,
      id,
      slug,
    }));
  });

  // Await all promises to resolve and flatten the results
  const postsFromServer = await Promise.all(promises).then((results) =>
    results
      .flat() // Flatten the array of results
      .map(
        ({ excerpt, title, date, id, categories, link, content }) =>
          processPost({ excerpt, title, date, id, categories, link, content }), // Process each post
      ),
  );

  // Data to be cached
  const data = {
    posts: postsFromServer,
    totalPosts,
    allCategories,
  };

  // Cache the fetched data for future use
  cache.set(key, data, { ttl: calculateDynamicTTL() });
  console.log(`[fetchPosts] Cache miss for key: ${key}. Data cached.`);

  // Return the fetched data
  return data;
}

/**
 * Helper function to process individual posts.
 * Processes the content (e.g., extracts image and audio URLs) for easy rendering.
 * @param {any} post Data for an individual post
 * @returns Processed post data
 */

/**
 * Processes an individual post to extract relevant data.
 * @param {any} post The raw post data from the server.
 * @returns Processed post data.
 */
function processPost(post: any) {
  const { excerpt, title, date, id, categories, link, content } = post;

  const audioUrl = extractAudioUrl(excerpt.rendered);
  const imageUrl = extractImageUrl(content.rendered);

  const categoryDetails = categories
    .filter((categoryId: number) => categoryId !== ROOT_CATEGORY_ID)
    .map((categoryId: number) =>
      StaticCategoryData.find(
        (category: Category) => category?.id === categoryId,
      ),
    )
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

/**
 * Helper function to extract audio URL from post content.
 */
function extractAudioUrl(excerptRendered: string): string {
  const audioPattern = /src="([^"]*)"/;
  const match = excerptRendered.match(audioPattern);
  return match
    ? match[1].replace(
        /^(https?:\/\/)?(www\.)?paullowe\.org\/wp-content\/uploads\//,
        "",
      )
    : "";
}

/**
 * Helper function to extract image URL from post content.
 */
function extractImageUrl(contentRendered: string): string {
  const imagePattern = /src="([^"]+\.(jpg|jpeg|png|gif))"/;
  const match = contentRendered.match(imagePattern);
  return match
    ? match[1].replace(
        /^(https?:\/\/)?(www\.)?paullowe\.org\/wp-content\/uploads\//,
        "",
      )
    : "";
}

/**
 * Possible Refactoring Ideas:
 * 1. **TypeScript Enhancement**: Define stronger TypeScript types for `processPost` and `promises` to ensure type safety throughout the data flow.
 * 2. **Concurrency**: Utilize React's `useTransition` to manage transitions and non-blocking updates when posts are fetched.
 * 3. **Error Handling**: Add proper error handling for `Promise.all` to manage scenarios where some requests fail and log the errors.
 * 4. **SWR/React Query**: Consider using SWR or React Query to handle fetching and caching of posts for better state management and data consistency.
 */

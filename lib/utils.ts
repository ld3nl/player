import axios, { type AxiosResponse } from "axios"; // Import axios and AxiosResponse type
import { CATEGORY_API_URL, POSTS_API_URL } from "./constants"; // Import API URLs from constants
import type { Post } from "./types"; // Type the WordPress post responses

/**
 * Fetches posts from the server.
 * @param {number | null} term - The category ID or null to fetch all posts.
 * @param {number | null} per_page - Number of posts per page (for pagination).
 * @param {number | null} offset - Offset for paginated results.
 * @returns {Promise<Post[]>} A promise that resolves with the posts.
 */
export const getAllPostsFromServer = async (
  term: number = 0,
  per_page: number = 10,
  offset: number = 0,
): Promise<Post[]> => {
  try {
    const response: AxiosResponse<Post[]> = await axios.get<Post[]>(
      `${POSTS_API_URL}`, // API URL for fetching posts
      {
        // Ask upstream HTTP caches to revalidate and avoid storing this response.
        headers: {
          "Cache-Control": "no-cache, no-store, max-age=0",
          Pragma: "no-cache",
        },
        params: {
          "categories[terms]": term, // Filter posts by category
          per_page: per_page, // Set number of posts per page
          offset: offset, // Offset for pagination
          _fields: "id,title,excerpt,content,categories,date,link", // Select specific fields
        },
      },
    );
    return response.data; // Return the list of posts
  } catch (error) {
    console.error(error); // Log error in case of failure
    // Reject failed batches so the catalog cache never stores a partial result.
    throw error;
  }
};

/**
 * Fetches the total count of posts in a category.
 * @param {number} id - The ID of the category.
 * @returns {Promise<number>} A promise that resolves with the count of posts.
 */
export const getCategoryCount = async (id: number): Promise<number> => {
  try {
    const response: AxiosResponse<{ count: number }> = await axios.get<{
      count: number;
    }>(`${CATEGORY_API_URL}/${id}`, {
      // Counts must be fresh too, because they determine the post batch requests.
      headers: {
        "Cache-Control": "no-cache, no-store, max-age=0",
        Pragma: "no-cache",
      },
    }); // Fetch category by ID
    return response.data.count; // Return the count of posts in the category
  } catch (error) {
    console.error(error); // Log error in case of failure
    // A failed count must not become a successfully cached empty catalog.
    throw error;
  }
};

// Static data representing predefined categories with their IDs, names, and slugs
export const StaticCategoryData = [
  { id: 56, name: "anger / blame / judgement", slug: "anger" },
  { id: 80, name: "audio", slug: "podcast" },
  { id: 50, name: "awakening / consciousness", slug: "awakening" },
  { id: 75, name: "communication", slug: "communication" },
  { id: 99, name: "death / NDE", slug: "death" },
  { id: 69, name: "fear / depression", slug: "fear" },
  { id: 76, name: "giving back", slug: "giving-back" },
  { id: 57, name: "gratitude / complaint", slug: "gratitude-complaint" },
  { id: 93, name: "here &amp; now", slug: "here-now" },
  { id: 95, name: "knowing &amp; not-knowing", slug: "knowing-not-knowing" },
  {
    id: 87,
    name: "mind / conditioning / behaviour",
    slug: "mind-conditioning-behaviour",
  },
  { id: 71, name: "peace / bliss / love", slug: "peace-bliss-love" },
  {
    id: 86,
    name: "politics / economics / science",
    slug: "politics-economics",
  },
  { id: 83, name: "reality", slug: "reality" },
  {
    id: 60,
    name: "relationship / sexuality / jealousy",
    slug: "relationship-sexuality",
  },
  { id: 84, name: "spirituality / religion", slug: "spirituality-religion" },
  { id: 92, name: "state of the planet", slug: "state-of-the-planet" },
  { id: 94, name: "uplifting / fun", slug: "uplifting-fun" },
  { id: 77, name: "video", slug: "video" },
  { id: 79, name: "writings", slug: "writings" },
];

/**
 * Possible Refactoring Ideas:
 * 1. **Environment Variables**: Move the API URLs to environment variables (`process.env`) for better flexibility and security, especially in different environments.
 * 2. **Error Handling Improvements**: Implement a more structured error-handling mechanism. You could introduce custom error types to differentiate between client, server, or network errors.
 * 3. **TypeScript Enhancements**: Use stricter types, especially for response data, to ensure API responses conform to expected structures.
 * 5. **Data Fetching Optimizations**: Batch API requests where possible (e.g., fetching multiple categories in one request) to reduce the number of API calls and improve performance.
 */

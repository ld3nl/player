import axios, { AxiosResponse } from "axios"; // Import axios and AxiosResponse type
import {
  POSTS_API_URL,
  AUTHORS_API_URL,
  MEDIA_API_URL,
  CATEGORY_API_URL,
} from "./constants"; // Import API URLs from constants
import { Category, Post } from "./types"; // Import necessary types

/**
 * Fetches posts from the server.
 * @param {number | null} term - The category ID or null to fetch all posts.
 * @param {number | null} per_page - Number of posts per page (for pagination).
 * @param {number | null} offset - Offset for paginated results.
 * @returns {Promise<Post[]>} A promise that resolves with the posts.
 */
export const getAllPostsFromServer = async (
  term: number | null = null,
  per_page: number | null = null,
  offset: number | null = null,
): Promise<Post[]> => {
  try {
    const response: AxiosResponse<Post[]> = await axios.get<Post[]>(
      `${POSTS_API_URL}`, // API URL for fetching posts
      {
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
    return []; // Return an empty array if the request fails
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
    }>(`${CATEGORY_API_URL}/${id}`); // Fetch category by ID
    return response.data.count; // Return the count of posts in the category
  } catch (error) {
    console.error(error); // Log error in case of failure
    return 0; // Return 0 if the request fails
  }
};

/**
 * Fetches detailed information for a specific category.
 * @param {number} id - The ID of the category.
 * @returns {Promise<Category>} A promise that resolves with the category data.
 */
export const getCategoryData = async (id: number): Promise<Category> => {
  try {
    const response: AxiosResponse<Category[]> = await axios.get<Category[]>(
      `${CATEGORY_API_URL}`, // API URL for fetching categories
      {
        params: {
          "categories[terms]": id, // Filter by category ID
          _fields: "name,id,slug", // Fetch only specific fields
          per_page: 99, // Limit results to 99
        },
      },
    );

    // Handle the case where the category is not found
    if (response.data.length === 0) {
      throw new Error("Category not found"); // Throw an error if the category is not found
    }

    return response.data[0]; // Return the first category found
  } catch (error) {
    console.error(error); // Log error in case of failure
    throw error; // Rethrow the error to be handled by the caller
  }
};

/**
 * Fetches the name of an author by their ID.
 * @param {number} id - The ID of the author.
 * @returns {Promise<string>} A promise that resolves with the author's name.
 */
export const getAuthor = async (id: number): Promise<string> => {
  try {
    const response: AxiosResponse<{ name: string }> = await axios.get<{
      name: string;
    }>(`${AUTHORS_API_URL}/${id}`); // Fetch author by ID
    return response.data.name; // Return the author's name
  } catch (error) {
    console.error(error); // Log error in case of failure
    return ""; // Return an empty string if the request fails
  }
};

/**
 * Fetches the featured image for a post.
 * @param {number} id - The ID of the media item.
 * @returns {Promise<string>} A promise that resolves with the URL of the image.
 */
export const getFeaturedImage = async (id: number): Promise<string> => {
  try {
    const response: AxiosResponse<{ guid: { rendered: string } }> =
      await axios.get<{ guid: { rendered: string } }>(`${MEDIA_API_URL}/${id}`); // Fetch media by ID
    return response.data.guid.rendered; // Return the URL of the image
  } catch (error) {
    console.error(error); // Log error in case of failure
    return ""; // Return an empty string if the request fails
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
 * 4. **Caching**: Add caching mechanisms (like `SWR` or `React Query`) to avoid repeated API calls for the same data (e.g., categories or authors) and improve performance.
 * 5. **Data Fetching Optimizations**: Batch API requests where possible (e.g., fetching multiple categories in one request) to reduce the number of API calls and improve performance.
 */

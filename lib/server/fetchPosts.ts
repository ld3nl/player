import { cacheLife } from "next/cache";
import { ROOT_CATEGORY_ID } from "../constants"; // Constant for the root category ID
import type { ApiPost, Category, homePost, Post, PostsData } from "../types"; // Type definitions for server and UI post shapes
import {
  getAllPostsFromServer,
  getCategoryCount,
  StaticCategoryData,
} from "../utils"; // Utilities for fetching data and static categories

/**
 * Share the public WordPress catalog between the homepage and posts API.
 * Keep the count and all post batches in one cache entry so they refresh together.
 * @returns {Promise<PostsData>} The posts data and metadata required for rendering the homepage.
 */
export async function fetchPosts(): Promise<PostsData> {
  "use cache";

  // Refresh in the background after a minute; wait for fresh data after five minutes.
  // The client stale time also lets Next.js include the catalog in the app shell.
  cacheLife({ stale: 300, revalidate: 60, expire: 300 });

  // Fetch the total number of posts and categories count from the server
  const categoriesCount = await getCategoryCount(ROOT_CATEGORY_ID);
  const totalPosts = categoriesCount;

  // Calculate the number of API requests needed based on the total number of posts
  const numberOfRequests = Math.ceil(totalPosts / 99);

  // Prepare to fetch all posts in parallel using promises
  const promises = Array.from({ length: numberOfRequests }, (_, i) => {
    const offset = i * 99; // Offset to request batches of posts
    return getAllPostsFromServer(ROOT_CATEGORY_ID, 99, offset);
  });

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
  const results = await Promise.all(promises);
  const postsFromServer = results.flat().map(process_post);

  // Share only public data; user favorites and playback state live on the client.
  return {
    posts: postsFromServer,
    postNewStructure: postsFromServer.map((post) => post.newStructure),
    totalPosts,
    allCategories,
    pagination: {
      current_page: 1,
      total_pages: 1,
      per_page: 1,
      total_posts: totalPosts,
    },
  };
}

// Keep the homepage and API representations consistent when processing fresh data.
const process_post = (post: Post): homePost & { newStructure: ApiPost } => {
  const { excerpt, title, date, id, categories, link, content } = post;

  const audioUrl = extractAudioUrl(excerpt.rendered);
  const imageUrl = extractImageUrl(content.rendered);

  const categoryDetails = categories
    .filter((categoryId) => categoryId !== ROOT_CATEGORY_ID)
    .map((categoryId) =>
      StaticCategoryData.find(
        (category: Category) => category?.id === categoryId,
      ),
    )
    .filter((category): category is Category => category !== undefined);

  return {
    id,
    imageUrl,
    audioUrl,
    title: title.rendered,
    date,
    categories: categoryDetails,
    link,
    newStructure: {
      id: id,
      title: title.rendered,
      audio_url: audioUrl,
      image_url: imageUrl,
      published_at: date,
      categories: categoryDetails,
      link: link,
    },
  };
};

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
 * 2. **Concurrency**: Utilize React's `useTransition` to manage transitions and non-blocking updates when posts are fetched.
 * 3. **Error Handling**: Add proper error handling for `Promise.all` to manage scenarios where some requests fail and log the errors.
 */

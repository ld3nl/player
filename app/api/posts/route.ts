import { NextResponse } from "next/server";
import { fetchPosts } from "@/lib/server/fetchPosts";
import { NextRequest } from "next/server";

/**
 * Filters an array of posts based on the provided criteria.
 *
 * @param {Array} posts - The array of posts to filter.
 * @param {Object} criteria - The criteria to filter the posts by.
 * @param {string} [criteria.category] - The category to filter posts by. If not provided, category is not used as a filter.
 * @param {string} [criteria.startDate] - The start date to filter posts by. Posts created before this date will be excluded. If not provided, start date is not used as a filter.
 * @param {string} [criteria.endDate] - The end date to filter posts by. Posts created after this date will be excluded. If not provided, end date is not used as a filter.
 * @returns {Array} The filtered array of posts.
 *
 * @example
 * const posts = [
 *   { category: 'tech', createdAt: '2023-01-01' },
 *   { category: 'health', createdAt: '2023-02-01' },
 * ];
 * const criteria = { category: 'tech', startDate: '2023-01-01', endDate: '2023-12-31' };
 * const filteredPosts = filterPosts(posts, criteria);
 * // filteredPosts will be [{ category: 'tech', createdAt: '2023-01-01' }]
 */
function filterPosts(posts: any, { category, startDate, endDate }: any) {
  // console.log("Filtering criteria:", { category, startDate, endDate });
  return posts.filter((post: any) => {
    let isValid = true;

    // Check if the post categories include the category filter
    if (category) {
      const categoryMatches = post.categories.some(
        (cat: any) => cat.slug === category,
      );
      if (!categoryMatches) {
        isValid = false;
      }
    }

    // Check if the post's publish date is after startDate (if provided)
    if (startDate && new Date(post.published_at) < new Date(startDate)) {
      isValid = false;
    }

    // Check if the post's publish date is before endDate (if provided)
    if (endDate && new Date(post.published_at) > new Date(endDate)) {
      isValid = false;
    }

    return isValid;
  });
}

/**
 * Handles GET requests to fetch and filter posts.
 *
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} - A promise that resolves to a JSON response containing the filtered posts and pagination data.
 *
 * @throws {Error} - Throws an error if fetching posts fails.
 *
 * The function performs the following steps:
 * 1. Fetches all posts using the `fetchPosts` function.
 * 2. Extracts query parameters (`category`, `startDate`, `endDate`) from the request URL.
 * 3. Filters the fetched posts based on the extracted query parameters using the `filterPosts` function.
 * 4. Returns a JSON response containing the filtered posts and pagination data.
 * 5. If an error occurs during the process, logs the error and returns a JSON response with an error message and a 500 status code.
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all posts at once
    // const { postNewStructure, pagination } = await fetchPosts();
    const { posts, totalPosts, allCategories } = await fetchPosts();

    // console.log("Fetched posts:", postNewStructure);

    // // Extract query parameters from the URL
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    console.log("Query parameters:", { category, startDate, endDate });

    // // Filter posts based on the query parameters
    // const filteredPosts = filterPosts(postNewStructure, {
    //   category,
    //   startDate,
    //   endDate,
    // });

    const fivePosts = posts.slice(0, 5);
    // console.log("Filtered posts:", filteredPosts);

    // Return the filtered posts along with pagination data (if applicable)
    // only show 5 posts
    // return NextResponse.json({ posts
    //   // filteredPosts,
    return NextResponse.json({ posts: fivePosts, totalPosts, allCategories });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

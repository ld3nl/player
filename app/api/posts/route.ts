import { unstable_rethrow } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { fetchPosts } from "@/lib/server/fetchPosts";
import type { ApiPost } from "@/lib/types";

type PostFilters = {
  category: string | null;
  startDate: string | null;
  endDate: string | null;
};

// Missing query parameters leave the corresponding category or date filter inactive.
const filter_posts = (
  posts: ApiPost[],
  { category, startDate, endDate }: PostFilters,
) => {
  // console.log("Filtering criteria:", { category, startDate, endDate });
  return posts.filter((post) => {
    let isValid = true;

    // Check if the post categories include the category filter
    if (category) {
      const categoryMatches = post.categories.some(
        (cat) => cat.slug === category,
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
};

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
 * 3. Filters the fetched posts based on the extracted query parameters using the `filter_posts` function.
 * 4. Returns a JSON response containing the filtered posts and pagination data.
 * 5. If an error occurs during the process, logs the error and returns a JSON response with an error message and a 500 status code.
 */
export async function GET(request: NextRequest) {
  try {
    // Reuse the public catalog, then apply this request's filters outside the cache.
    const { postNewStructure, pagination } = await fetchPosts();
    // console.log("Fetched posts:", postNewStructure);

    // Extract query parameters from the URL
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // console.log("Query parameters:", { category, startDate, endDate });

    // Filter posts based on the query parameters
    const filteredPosts = filter_posts(postNewStructure, {
      category,
      startDate,
      endDate,
    });

    // Return the filtered posts along with pagination data (if applicable)
    return NextResponse.json({ posts: filteredPosts, pagination });
  } catch (error) {
    // Let Next.js handle prerender interruptions before handling upstream failures.
    unstable_rethrow(error);
    console.error("Error fetching posts:", error);

    if (error instanceof TypeError) {
      return NextResponse.json(
        { error: "Invalid data format received" },
        { status: 422 },
      );
    } else {
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 },
      );
    }
  }
}

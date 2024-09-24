import type { Metadata } from "next"; // Type for metadata that helps with SEO and defining page properties in Next.js
import { getBaseUrl } from "@/lib/dynamic"; // Helper function to get the base URL based on the environment
// import { fetchPosts } from "@/lib/server/fetchPosts"; // Server-side data fetching function for posts

import HomeClient from "../components/HomeClient"; // Import the client component to render data on the homepage

// Metadata for the Home page, used by Next.js to populate the HTML <head> for SEO purposes
export const metadata: Metadata = {
  title: "Paul Lowe Talks source https://www.paullowe.org", // Title of the page, useful for SEO and tab display
  description: "Paul Lowe Talks homepage with latest updates.", // Meta description for search engine previews
};

// The main async function that represents the Home page component
export default async function Home() {
  // Fetch data from the API route
  const response = await fetch(`${getBaseUrl()}/api/posts`);

  // const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts`);

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  const { posts, totalPosts, allCategories } = await response.json();
  // console.log(
  //   "Fetching posts...",
  //   `${process.env.NEXT_PUBLIC_BASE_URL}/api/posts`,
  // );

  // // Fetch posts, total post count, and all categories data from the server-side function
  // const { posts, totalPosts, allCategories } = await fetchPosts();

  // Rendering the HomeClient component with fetched data as props
  return (
    <>
      <HomeClient
        posts={posts} // List of posts to display
        totalPosts={totalPosts} // Total number of posts for pagination or display purposes
        allCategories={allCategories} // Categories to filter or categorize posts
      />
    </>
  );
}

/**
 * Possible Refactoring Ideas:
 * 1. **Error Handling**: Implement error handling for `fetchPosts` to catch and display errors gracefully in case the fetch fails.
 * 2. **Suspense**: Leverage React's `Suspense` for better handling of loading states, especially if the data fetch is critical for the page.
 * 3. **Caching**: Use a data fetching library like SWR or React Query to manage caching and automatic data revalidation for performance improvement.
 * 4. **Metadata Enhancements**: Dynamically update the metadata based on the content of `posts` to improve SEO, e.g., use post titles for the title tag.
 */

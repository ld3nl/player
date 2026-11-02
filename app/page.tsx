import type { Metadata } from "next"; // Type for metadata that helps with SEO and defining page properties in Next.js

import { fetchPosts } from "@/lib/server/fetchPosts"; // Server-side data fetching function for posts

import HomeClient from "../components/HomeClient"; // Import the client component to render data on the homepage

// Metadata for the Home page, used by Next.js to populate the HTML <head> for SEO purposes
export const metadata: Metadata = {
  title: "Paul Lowe Talks | A space to listen", // Title of the page, useful for SEO and tab display
  description:
    "Explore conversations with Paul Lowe on awareness, relationships and everyday life. Save a talk and return to where you left off.", // Meta description for search engine previews
};

// The main async function that represents the Home page component
export default async function Home() {
  // Fetch posts, total post count, and all categories data from the server-side function
  const { posts, totalPosts, allCategories } = await fetchPosts();

  return (
    <HomeClient
      posts={posts} // List of posts to display
      totalPosts={totalPosts} // Total number of posts for pagination or display purposes
      allCategories={allCategories} // Categories to filter or categorize posts
    />
  );
}

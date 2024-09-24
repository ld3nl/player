import type { Metadata } from "next";

import { fetchPosts } from "@/lib/server/fetchPosts";

import HomeClient from "../components/HomeClient"; // Import the client component

export const metadata: Metadata = {
  title: "Paul Lowe Talks source https://www.paullowe.org",
  description: "Paul Lowe Talks homepage with latest updates.",
};

export default async function Home() {
  const { posts, totalPosts, allCategories } = await fetchPosts();

  return (
    <>
      <HomeClient
        posts={posts}
        totalPosts={totalPosts}
        allCategories={allCategories}
      />
    </>
  );
}

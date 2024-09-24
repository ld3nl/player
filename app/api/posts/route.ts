// app/api/posts.ts
import { NextResponse } from "next/server"; // Import NextResponse for API route handling
import { fetchPosts } from "@/lib/server/fetchPosts";

export async function GET() {
  try {
    const postsData = await fetchPosts(); // Attempt to fetch posts
    return NextResponse.json(postsData); // Return the fetched data as JSON
  } catch (error) {
    console.error("Error fetching posts:", error); // Log the error

    // Dummy fallback data
    const dummyData = {
      posts: [
        {
          id: 1,
          title: "Dummy Post 1",
          excerpt: "This is a fallback post when fetching fails.",
          date: "2023-01-01",
          link: "/dummy-post-1",
          categories: [{ id: 1, name: "Category 1" }],
        },
        {
          id: 2,
          title: "Dummy Post 2",
          excerpt: "Another fallback post with dummy data.",
          date: "2023-01-02",
          link: "/dummy-post-2",
          categories: [{ id: 2, name: "Category 2" }],
        },
      ],
      totalPosts: 2,
      allCategories: [
        { id: 1, name: "Category 1" },
        { id: 2, name: "Category 2" },
      ],
    };

    return NextResponse.json(dummyData, { status: 200 }); // Return dummy data as fallback
  }
}

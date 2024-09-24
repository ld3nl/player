// app/api/posts.ts
import { NextResponse } from "next/server"; // Import NextResponse for API route handling

// import { NextApiRequest, NextApiResponse } from "next";
import { fetchPosts } from "@/lib/server/fetchPosts";
// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
//   try {
//     const postsData = await fetchPosts(); // Call the utility function to fetch posts
//     res.status(200).json(postsData); // Return the fetched data as JSON
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching posts" });
//   }
// }

export async function GET() {
  try {
    const postsData = await fetchPosts(); // Call the utility function to fetch posts
    return NextResponse.json(postsData); // Return the fetched data as JSON
  } catch (error) {
    console.error("Error fetching posts:", error); // Log error
    return NextResponse.json(
      { message: "Error fetching posts", error },
      { status: 500 },
    ); // Return error response
  }
}

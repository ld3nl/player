import type { NextRequest } from "next/server";
import { getParamsIdOrSlug } from "../../../lib/routerHelper";
import { StaticCategoryData } from "../../../lib/utils";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { id, slug } = await getParamsIdOrSlug(searchParams);

  // Get name from static data depending on the id or slug
  const category = StaticCategoryData.find(
    (category) => category.id === Number(id) || category.slug === slug,
  );

  // Check if category is found
  if (!category) {
    console.error("Category not found");
    // Use NextResponse.json to return a JSON response
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  // Category 80 is hardcoded to be the audio category
  const requestUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_BASE_URL}/posts?categories=80,${category.id}&_fields[]=id&_fields[]=title&_fields[]=slug&offset=0&per_page=99`;

  // Fetch data from the CMS and handle the response
  const cmsResponse = await fetch(requestUrl);
  let jsonResponse;

  try {
    // Check if the response is OK
    if (!cmsResponse.ok) {
      // If we got a 404 Not Found or similar error
      console.error("Failed to fetch CMS data");
      // Return a JSON response with an error message
      return NextResponse.json(
        { error: "Failed to fetch CMS data" },
        { status: cmsResponse.status },
      );
    }

    // Parse the response as JSON
    jsonResponse = await cmsResponse.json();
  } catch (error) {
    console.error("Error parsing CMS response", error);
    // Return a JSON response with an error message
    return NextResponse.json(
      { error: "Error parsing CMS response" },
      { status: 500 },
    );
  }

  // Return the JSON response with the appropriate status
  return NextResponse.json(
    { posts: jsonResponse, category: category },
    { status: cmsResponse.status },
  );
}

import { NextResponse } from "next/server";

/**
 * Extracts the 'id' or 'slug' from the search parameters.
 * @param {URLSearchParams} searchParams - The search parameters from the URL.
 * @returns {Promise<{ id: string | null; slug: string | null }>} An object containing the 'id' or 'slug'.
 */
export const getParamsIdOrSlug = async (searchParams: URLSearchParams) => {
  const id = searchParams.get("id");
  const slug = searchParams.get("slug");

  // Check if either 'id' or 'slug' is provided in the query parameters
  if (!(id || slug)) {
    // Return a rejected promise with an error response
    return Promise.reject(
      NextResponse.json({ error: "ID or SLUG is required" }, { status: 400 }),
    );
  }

  return { id, slug };
};

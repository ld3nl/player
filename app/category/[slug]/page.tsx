import { Suspense } from "react";
import CategoryAudioListing from "@/components/CategoryAudioListing/CategoryAudioListing";

// Force dynamic rendering for real-time data
export const dynamic = "force-dynamic";

// Define proper types for params and searchParams
// type Params = Promise<{ slug: string }>;
// type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const fetchData = async (prop: string | string[] | number | undefined) => {
  // Check if prop is provided, log a warning and return early if not
  if (!prop) {
    console.warn("No prop provided");
    return;
  }

  // Initialize urlString
  let urlString = "";

  // Determine the URL based on the type and value of prop
  if (typeof prop === "string") {
    // Check if it's a valid number string
    if (!Number.isNaN(Number(prop))) {
      urlString = `${process.env.NEXT_PUBLIC_BASE_URL}/api/category?id=${prop}`;
    } else {
      urlString = `${process.env.NEXT_PUBLIC_BASE_URL}/api/category?slug=${prop}`;
    }
  } else if (Array.isArray(prop)) {
    // Join array values into a comma-separated string for multiple ids
    urlString = `${process.env.NEXT_PUBLIC_BASE_URL}/api/category?ids=${prop.join(",")}`;
  } else if (typeof prop === "number") {
    urlString = `${process.env.NEXT_PUBLIC_BASE_URL}/api/category?id=${prop}`;
  }

  // Fetch data using the correctly formed urlString
  try {
    const res = await fetch(urlString);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  // Await both params and searchParams
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const slug = resolvedParams.slug;

  // Use resolved search params
  const data = await fetchData(
    resolvedSearchParams?.id || resolvedSearchParams?.slug || slug,
  );

  if (!data) {
    return (
      <div className="min-h-screen bg-cyan-950 px-5">
        <h1 className="text-red-400">Error loading category data</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyan-950 px-5">
      <h1 className="mb-1 text-base font-bold capitalize text-gray-400">
        {data.category?.name}
      </h1>
      <Suspense fallback={<div>Loading posts...</div>}>
        <CategoryAudioListing posts={data.posts} />
      </Suspense>
    </div>
  );
}

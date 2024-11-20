import CategoryAudioListing from "@/components/CategoryAudioListing/CategoryAudioListing";

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
  searchParams,
  params,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  params: { slug: string };
}) {
  const { category, posts } = await fetchData(
    searchParams?.id || searchParams?.slug || params?.slug,
  );

  console.log(posts);

  return (
    <div className="min-h-screen bg-cyan-950 px-5">
      {/* <h1>{category.name}</h1> */}
      <h1 className="mb-1 text-base font-bold capitalize text-gray-400">
        {category.name}
      </h1>
      {/* <p className="font-sans text-gray-400">
        In these live recorded sessions, Loch shares advanced techniques for
        supporting awakening as the next natural stage of human development.
        You’ll learn how to shift out of your chattering mind and into embodied,
        awake awareness, as well as how to sustain, create, and relate from that
        open-hearted awareness in the midst of everyday life.
      </p> */}
      <CategoryAudioListing posts={posts} />
    </div>
  );
}

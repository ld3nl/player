// import { useEffect, useState } from "react";

import MainPlayer from "@/components/MainPlayer/MainPlayer";

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
      urlString = `${process.env.NEXT_PUBLIC_BASE_URL}/api/media?id=${prop}`;
    } else {
      urlString = `${process.env.NEXT_PUBLIC_BASE_URL}/api/media?slug=${prop}`;
    }
  } else if (Array.isArray(prop)) {
    // Join array values into a comma-separated string for multiple ids
    urlString = `${process.env.NEXT_PUBLIC_BASE_URL}/api/media?ids=${prop.join(",")}`;
  } else if (typeof prop === "number") {
    urlString = `${process.env.NEXT_PUBLIC_BASE_URL}/api/media?id=${prop}`;
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

export default async function Page({
  searchParams,
  params,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  params: { slug: string };
}) {
  const { title, link, date, audioUrl } = await fetchData(
    searchParams?.id || searchParams?.slug || params?.slug,
  );

  const dummyProp = {
    imageSrc: "",
    playedSeconds: 0,
    duration: 0,
    isFavorite: false,
  };

  return (
    <MainPlayer
      mediaItem={{
        ...dummyProp,
        title,
        link,
        date,
        src: `https://www.paullowe.org/wp-content/uploads/${audioUrl}`,
      }}
    />
  );
}

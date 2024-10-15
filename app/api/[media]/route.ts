import { NextRequest, NextResponse } from "next/server";
import {
  extractAudioUrl,
  extractImageUrl,
} from "../../../lib/server/fetchPosts";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const slug = searchParams.get("slug");

  console.log(id || slug);
  // Check if either 'id' or 'slug' is provided in the query parameters
  if (!(id || slug)) {
    return NextResponse.json(
      { error: "ID or SLUG is required" },
      { status: 400 },
    );
  }

  let identifierParam = "";

  if (slug) {
    identifierParam = `?slug=${slug}&`;
  } else {
    identifierParam = `/${id}?`;
  }

  // ?slug=post-slug
  // Fetch data from the CMS
  const cmsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_API_BASE_URL}/posts${identifierParam}_fields[]=title&_fields[]=slug&_fields[]=link&_fields[]=date&_fields[]=excerpt`,
  );
  if (!cmsResponse.ok) {
    return NextResponse.json({ error: "Failed to fetch data from CMS" }, { status: cmsResponse.status });
  }
  let data = await cmsResponse.json();
  if (!data) {
    return NextResponse.json({ error: "Data not found" }, { status: 404 });
  }
  if (slug && (!Array.isArray(data) || data.length === 0)) {
    return NextResponse.json({ error: "Data not found" }, { status: 404 });
  }
  if (slug) {
    data = data[0];
  }

  const audioUrl = extractAudioUrl(data?.excerpt?.rendered);
  const imageUrl = extractImageUrl(data?.excerpt?.rendered);

  console.log(audioUrl);

  return NextResponse.json({
    title: data.title.rendered,
    audioUrl,
    imageUrl,
    slug: data.slug,
    link: data.link,
    date: data.date,
  });
}

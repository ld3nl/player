import { NextRequest, NextResponse } from "next/server";
// import { parseStream } from "music-metadata";
// import { Readable } from "stream";

import {
  extractAudioUrl,
  extractImageUrl,
} from "../../../lib/server/fetchPosts";
import { getParamsIdOrSlug } from "../../../lib/routerHelper";

// Utility to convert ArrayBuffer to a Node.js Readable Stream
// function bufferToStream(buffer) {
//   const readable = new Readable();
//   readable.push(Buffer.from(buffer)); // Push the buffer to the stream
//   readable.push(null); // Indicate the end of the stream
//   return readable;
// }

/**
 * Fetches detailed information for a specific media item.
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} A promise that resolves with the response.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { id, slug } = await getParamsIdOrSlug(searchParams);

  let identifierParam = "";

  if (slug) {
    identifierParam = `?slug=${slug}&`;
  } else {
    identifierParam = `/${id}?`;
  }

  // ?slug=post-slug
  // Fetch data from the CMS

  const cmsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_API_BASE_URL}/posts${identifierParam}_fields[]=excerpt`,
  );
  if (!cmsResponse.ok) {
    return NextResponse.json(
      { error: "Failed to fetch data from CMS" },
      { status: cmsResponse.status },
    );
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

  if (!audioUrl) {
    return NextResponse.json({ error: "Audio URL not found" }, { status: 404 });
  }

  // const audioResponse = await fetch(
  //   `https://www.paullowe.org/wp-content/uploads/${audioUrl}`,
  // );
  // if (!audioResponse.ok) {
  //   return NextResponse.json({ error: "Failed to fetch audio file" });
  // }

  // try {
  //   // Fetch the audio file as an ArrayBuffer
  //   const audioBuffer = await audioResponse.arrayBuffer();

  //   // Convert the buffer to a Readable stream
  //   const audioStream = bufferToStream(audioBuffer);

  //   // Get the mime type from the response headers (or set a default)
  //   const mimeType = audioResponse.headers.get("Content-Type") || "audio/mpeg";

  //   // Parse metadata from the stream
  //   const metadata = await parseStream(
  //     audioStream,
  //     { mimeType },
  //     { duration: true },
  //   );

  //   const { duration } = metadata.format;

  //   // Return the metadata in the response
  //   return NextResponse.json({
  //     audioUrl: `https://www.paullowe.org/wp-content/uploads/${audioUrl}`,
  //     duration: duration ? duration : "Duration could not be determined",
  //     imageUrl,
  //   });
  // } catch (error) {
  //   console.error("Error parsing audio metadata:", error);
  //   // return NextResponse.json({ error: "Error parsing audio metadata" });
  // }

  return NextResponse.json({
    audioUrl: `https://www.paullowe.org/wp-content/uploads/${audioUrl}`,
    imageUrl,
  });
}

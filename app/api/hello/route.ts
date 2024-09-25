import { NextResponse } from "next/server"; // Import NextResponse for API route handling

export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}

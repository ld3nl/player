import { decode } from "he";
import type { MediaState } from "@/lib/types";

// Shared fallbacks and display titles keep the featured talk and list consistent.
export const get_empty_state = (id: number): MediaState => ({
  id,
  playedSeconds: 0,
  duration: 0,
  isFavorite: false,
});
export const get_talk_title = (title: string) =>
  decode(title).replace(/\s*\(audio\)\s*$/i, "");

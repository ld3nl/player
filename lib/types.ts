import type { ButtonHTMLAttributes } from "react";

// Consider how many optional props you're passing for component clarity
export interface PlayerProps {
  mediaItem: {
    imageSrc?: string;
    title?: string;
    src?: string;
    // id?: number;
    link?: string;
    date?: string;
    id?: number;
    playedSeconds: number;
    duration: number;
    isFavorite: boolean;
  };
  // eslint-disable-next-line no-unused-vars
  // setModalCallback: (modal: Modal) => void;
  setGlobalMediaState?: (
    // eslint-disable-next-line no-unused-vars
    id: number,
    // eslint-disable-next-line no-unused-vars
    playedSeconds: number,
    // eslint-disable-next-line no-unused-vars
    duration: number,
    // eslint-disable-next-line no-unused-vars
    isFavorite: boolean,
  ) => void;

  closeModal: () => void;
  // eslint-disable-next-line no-unused-vars
  stateCallback?: (item: {
    // eslint-disable-next-line no-unused-vars
    id: number;
    // eslint-disable-next-line no-unused-vars
    playedSeconds: number;
    // eslint-disable-next-line no-unused-vars
    duration: number;
    // eslint-disable-next-line no-unused-vars
    isFavorite: boolean;
  }) => void;
}

export type Modal = {
  isModalActive: boolean;
  selectedItem?: {
    imageSrc?: string;
    title?: string;
    src?: string;
    id?: number;
    link?: string;
    date?: string;
    playedSeconds: number;
    duration: number;
    isFavorite: boolean;
  };
};

// Using interface for easier extension in the future
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
  ariaLabel: string;
  onClick?: () => void;
}

// Using utility type Partial for flexibility with many nullable or optional fields
export type Category = {
  id: number;
  name: string;
  slug: string; // Optional fields can remain
};

// Ensuring consistency: id is a number
export type AudioListingProps = {
  title: string;
  date: string;
  // eslint-disable-next-line no-unused-vars
  // favoriteCallback?: (id?: number) => void; // Ensure consistency: id is a number
  categories?: Category[]; // Changed to `Category[]` for better type safety, good practice.
  link: string;
  // eslint-disable-next-line no-unused-vars
  setModalCallback?: () => void;
  playedSeconds: number; // Explicitly typed, good for clarity.
  duration: number; // Explicitly typed, no issues here.
  children?: React.ReactNode;
};

// Using a context provider in React could simplify prop drilling in future
export interface HeaderProps {
  search: string;
  category: number | null;
  categories: Category[];
  change_search: (value: string) => void;
  change_category: (value: number | null) => void;
}

// Making `className` optional allows flexibility in CSS handling
export interface DurationProps {
  className?: string;
  seconds: number;
}

// Using union types for safety, especially with `null | undefined`
export type homePost = {
  id: number;
  audioUrl: string;
  imageUrl: string;
  title: string;
  date: string;
  categories: Category[]; // Updated for better type safety
  link: string;
  newStructure?: ApiPost;
};

// The API uses normalized field names while the UI keeps its existing post shape.
export type ApiPost = {
  id: number;
  title: string;
  audio_url: string;
  image_url: string;
  published_at: string;
  categories: Category[];
  link: string;
};

type Pagination = {
  current_page: number;
  total_pages: number;
  per_page: number;
  total_posts: number;
};

// Consistent usage of `Category[]` is the best approach here
export type HomeProps = {
  posts: homePost[];
  totalPosts: number;
  allCategories: Category[]; // Updated for better type safety
  // Refactoring
  postNewStructure?: ApiPost[];
  pagination?: Pagination;
};

// Every fresh server result includes the API payload and pagination.
export type PostsData = HomeProps & {
  postNewStructure: ApiPost[];
  pagination: Pagination;
};

// Using utility types like `Pick` or `Omit` for deeply nested fields
export interface Post {
  id: number;
  title: Pick<{ rendered: string }, "rendered">;
  excerpt: Pick<{ rendered: string }, "rendered">;
  content: Pick<{ rendered: string }, "rendered">;
  categories: number[];
  featured_media: number;
  author: number;
  date: string;
  link: string;
}

export type MediaState = {
  id: number;
  playedSeconds: number;
  duration: number;
  isFavorite: boolean;
};

// TypeScript: Define the player state
export interface PlayerState {
  id: number;
  playedSeconds: number;
  duration: number;
  isFavorite: boolean;
  playing: boolean;
  volume: number;
  muted: boolean;
  pip: boolean;
  controls: boolean;
  light: boolean;
  playbackRate: number;
  loop: boolean;
  played: number;
  seeking: boolean;
}

// TypeScript: Define action types
export type PlayerAction =
  | { type: "SET_PLAYING"; payload: boolean }
  | { type: "SET_PLAYED_SECONDS"; payload: number }
  | { type: "SET_VOLUME"; payload: number }
  | { type: "SET_PLAYBACK_RATE"; payload: number }
  | { type: "TOGGLE_FAVORITE" }
  | { type: "SEEK"; payload: number }
  | { type: "SET_DURATION"; payload: number };

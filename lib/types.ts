import { ButtonHTMLAttributes } from "react";

// Using interface for easier extension in the future
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

// Using a centralized enum for icon names to avoid typos
// eslint-disable  @typescript-eslint/naming-convention
type SVGIconName =
  | "Play"
  | "ForwardRewind"
  | "BackwardRewind"
  | "Pause"
  | "Close"
  | "Favorite"
  | "Spinner"
  | "Link";

// Ensuring Size and Variation are properly used across the codebase
export type Size = "sm" | "md" | "twoThirds";
export type Variation = "active" | "default";

export interface IconProps {
  className?: string;
  name: SVGIconName; // Made `name` required, good decision.
  size?: Size; // Refactored into reusable type alias, very DRY approach.
  variation?: Variation; // Refactored into reusable type alias, again good for DRY.
  customVariation?: { active: string; default: string };
  customSize?: string;
}

// Using utility type Partial for flexibility with many nullable or optional fields
export type Category = Partial<{
  id: number;
  name: string;
  slug: string;
}>;

// Ensuring consistency: id is a number
export type AudioListingProps = {
  imageSrc: string;
  src: string;
  title: string;
  id: number;
  date: string;
  // eslint-disable-next-line no-unused-vars
  favoriteCallback?: (id?: number) => void; // Ensure consistency: id is a number
  categories?: (Category | null | undefined)[]; // Changed to `Category[]` for better type safety, good practice.
  link: string;
};

// Explicitly typed for better clarity
export type Progress = {
  playedSeconds: number; // Explicitly typed, good for clarity.
  duration: number; // Explicitly typed, no issues here.
};

// Using a context provider in React could simplify prop drilling in future
export interface HeaderProps {
  totalPosts: number;
  numberOfPosts: number;
  setNumberOfPosts: React.Dispatch<React.SetStateAction<number>>;
  handleSearchChange: React.Dispatch<React.SetStateAction<string[]>>;
  handleCategoryChange: React.Dispatch<React.SetStateAction<number[]>>;
  toggleFavorites: () => void;
  showFav: boolean;
  filteredCategoryList: (SimpleCategory | null | undefined)[];
}

// Making SVGProps extendable for future customizations
export interface SVGProps {
  name: SVGIconName; // Simplistic but effective, works well.
}

// Making `className` optional allows flexibility in CSS handling
export interface DurationProps {
  className?: string;
  seconds: number;
}

// Consider how many optional props you're passing for component clarity
export interface PlayerProps {
  imageSrc?: string;
  title?: string;
  src?: string;
  id?: number;
  link?: string;
}

// Using union types for safety, especially with `null | undefined`
export type homePost = {
  id: number;
  audioUrl: string;
  imageUrl: string;
  title: string;
  date: string;
  categories: (Category | null | undefined)[]; // Updated for better type safety
  link: string;
};

export type SimpleCategory = {
  id: number;
  name: string;
};

// Consistent usage of `Category[]` is the best approach here
export type HomeProps = {
  posts: homePost[];
  totalPosts: number;
  allCategories: (SimpleCategory | null | undefined)[]; // Updated for better type safety
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

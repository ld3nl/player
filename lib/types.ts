import { ButtonHTMLAttributes } from "react";

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

export type GlobalContextValue = {
  isModalActive: boolean;
  selectedItem: { title: string; date: string; src: string; id: number };
};

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

// Using a centralized enum for icon names to avoid typos
/* eslint-disable no-unused-vars */
export enum SVGIconName {
  Play = "Play",
  ForwardRewind = "ForwardRewind",
  BackwardRewind = "BackwardRewind",
  Pause = "Pause",
  Close = "Close",
  Favorite = "Favorite",
  Spinner = "Spinner",
  Link = "Link",
}
/* eslint-enable no-unused-vars */

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
  setModalCallback?: any;
  playedSeconds: number; // Explicitly typed, good for clarity.
  duration: number; // Explicitly typed, no issues here.
  children?: React.ReactNode;
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
  filteredCategoryList: Category[];
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

// Using union types for safety, especially with `null | undefined`
export type homePost = {
  id: number;
  audioUrl: string;
  imageUrl: string;
  title: string;
  date: string;
  categories: Category[]; // Updated for better type safety
  link: string;
};

// Consistent usage of `Category[]` is the best approach here
export type HomeProps = {
  posts: homePost[];
  totalPosts: number;
  allCategories: Category[]; // Updated for better type safety
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

// eslint-disable-next-line no-unused-vars
export type ValueSetter<T> = T | ((value: T) => T);

export type MediaState = {
  id: number;
  playedSeconds: number;
  duration: number;
  isFavorite: boolean;
};

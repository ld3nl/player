// Importing necessary types from the types file
import { Modal, PlayerState } from "./types";

// Use a separate environment variable for WordPress API base URL
const WORDPRESS_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORDPRESS_API_BASE_URL ||
  "https://www.paullowe.org/wp-json/wp/v2";

export const POSTS_API_URL = `${WORDPRESS_API_BASE_URL}/posts`; // API for fetching posts
export const CATEGORY_API_URL = `${WORDPRESS_API_BASE_URL}/categories`; // API for fetching categories
export const AUTHORS_API_URL = `${WORDPRESS_API_BASE_URL}/users`; // API for fetching authors
export const MEDIA_API_URL = `${WORDPRESS_API_BASE_URL}/media`; // API for fetching media items

// Default number of posts to be fetched and displayed on the page
export const DEFAULT_NUMBER_OF_POSTS = 30;

// Default state for the modal. Used to reset the modal to its initial state when closed.
export const DEFAULT_MODAL: Modal = {
  isModalActive: false, // Modal is not active by default
  selectedItem: {
    title: "", // No title by default
    date: "", // No date by default
    src: "", // No media source by default
    id: 0, // Default id is 0 (invalid state)
    playedSeconds: 0, // No audio has been played
    duration: 0, // Default duration is 0
    isFavorite: false, // Item is not a favorite by default
  },
};

// Root category ID to fetch posts related to a specific category.
// In this case, it's 80 which is hardcoded for the given use case.
export const ROOT_CATEGORY_ID: number = 80;

export const INITIAL_STATE: PlayerState = {
  id: 0,
  playedSeconds: 0,
  duration: 0,
  isFavorite: false,
  playing: true,
  volume: 0.8,
  muted: false,
  pip: false,
  controls: false,
  light: false,
  playbackRate: 1.0,
  loop: false,
  played: 0,
  seeking: false,
  isOpen: false,
  isAnimatingOut: false,
};

/**
 * Possible Refactoring Ideas:
 * 1. **Environment Variables**: Move the API URLs to environment variables (`process.env`) to make the code more flexible and secure. This avoids hardcoding sensitive information.
 * 2. **Dynamic Category ID**: Instead of hardcoding the `ROOT_CATEGORY_ID`, fetch it dynamically based on the category slug or name to avoid issues with hardcoded values.
 * 3. **TypeScript Enhancements**: Add more strict typing for API URLs or constants to ensure no accidental changes are made to these values during development.
 * 4. **Caching Mechanism**: Introduce a caching mechanism for API URLs and constants that rarely change, reducing unnecessary recomputation or fetching.
 * 5. **Config File**: Consider moving constants to a dedicated configuration file for better separation of concerns, especially if this file grows in complexity.
 */

import { Modal } from "./types";

export const POSTS_API_URL = "https://www.paullowe.org/wp-json/wp/v2/posts";
export const CATEGORY_API_URL =
  "https://www.paullowe.org/wp-json/wp/v2/categories";
export const AUTHORS_API_URL = "https://www.paullowe.org/wp-json/wp/v2/users";
export const MEDIA_API_URL = "https://www.paullowe.org/wp-json/wp/v2/media";

export const DEFAULT_NUMBER_OF_POSTS = 30;

// Modal default state, used to reset modal when closing.
export const DEFAULT_MODAL: Modal = {
  isModalActive: false,
  selectedItem: {
    title: "",
    date: "",
    src: "",
    id: 0,
    playedSeconds: 0,
    duration: 0,
    isFavorite: false,
  },
};

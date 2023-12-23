import axios, { AxiosResponse } from "axios";
import {
  POSTS_API_URL,
  AUTHORS_API_URL,
  MEDIA_API_URL,
  CATEGORY_API_URL,
} from "./constants";

interface Post {
  // Define the shape of a Post object
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  categories: number[];
  featured_media: number;
  author: number;
  date: string;
}

/**
 * Interface for Category object
 */
interface Category {
  id: number; // Unique identifier for the category
  name: string; // Human-readable name of the category
  slug: string; // URL-friendly string representing the category (usually used for routing)
}

export const getAllPostsFromServer = async (
  term: number | null = null,
  per_page: number | null = null,
  offset: number | null = null,
): Promise<Post[]> => {
  try {
    const response: AxiosResponse<Post[]> = await axios.get<Post[]>(
      `${POSTS_API_URL}`,
      {
        params: {
          "categories[terms]": term,
          per_page: per_page,
          offset: offset,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getCategoryCount = async (id: number): Promise<number> => {
  try {
    const response: AxiosResponse<{ count: number }> = await axios.get<{
      count: number;
    }>(`${CATEGORY_API_URL}/${id}`);
    return response.data.count;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

/**
 * Fetches category data from an API.
 * @param {number} id - The unique identifier of the category.
 * @returns {Promise<Category>} A promise that resolves with the category data.
 */
export const getCategoryData = async (id: number): Promise<Category> => {
  try {
    // Perform an HTTP GET request using axios
    // Best Practice: Use a constant for API URL to avoid hardcoding in multiple places
    const response: AxiosResponse<Category[]> = await axios.get<Category[]>(
      `${CATEGORY_API_URL}`, // Endpoint URL for the category API
      {
        params: {
          "categories[terms]": id, // Query parameter to specify the category ID
          _fields: "name,id,slug", // Fields to be returned in the response
          per_page: 99,
        },
      },
    );

    // Check if the response array is empty
    if (response.data.length === 0) {
      // Best Practice: Throw an error or handle empty responses appropriately
      throw new Error("Category not found");
    }

    // Return the first element from the response data array
    // Optimization: Assuming API returns an array, but we need only the first element
    return response.data[0];
  } catch (error) {
    // Log any errors to the console
    // Best Practice: Consider using a logging library for better error tracking
    console.error(error);

    // Best Practice: Rethrow the error or handle it according to your application's error handling policy
    throw error;
  }
};

export const getAuthor = async (id: number): Promise<string> => {
  try {
    const response: AxiosResponse<{ name: string }> = await axios.get<{
      name: string;
    }>(`${AUTHORS_API_URL}/${id}`);
    return response.data.name;
  } catch (error) {
    console.error(error);
    return "";
  }
};

export const getFeaturedImage = async (id: number): Promise<string> => {
  try {
    const response: AxiosResponse<{ guid: { rendered: string } }> =
      await axios.get<{ guid: { rendered: string } }>(`${MEDIA_API_URL}/${id}`);
    return response.data.guid.rendered;
  } catch (error) {
    console.error(error);
    return "";
  }
};

export const StaticCategoryData = [
  {
    id: 56,
    name: "anger / blame / judgement",
    slug: "anger",
  },
  {
    id: 80,
    name: "audio",
    slug: "podcast",
  },
  {
    id: 50,
    name: "awakening / consciousness",
    slug: "awakening",
  },
  {
    id: 75,
    name: "communication",
    slug: "communication",
  },
  {
    id: 99,
    name: "death / NDE",
    slug: "death",
  },
  {
    id: 69,
    name: "fear / depression",
    slug: "fear",
  },
  {
    id: 76,
    name: "giving back",
    slug: "giving-back",
  },
  {
    id: 57,
    name: "gratitude / complaint",
    slug: "gratitude-complaint",
  },
  {
    id: 93,
    name: "here &amp; now",
    slug: "here-now",
  },
  {
    id: 95,
    name: "knowing &amp; not-knowing",
    slug: "knowing-not-knowing",
  },
  {
    id: 87,
    name: "mind / conditioning / behaviour",
    slug: "mind-conditioning-behaviour",
  },
  {
    id: 71,
    name: "peace / bliss / love",
    slug: "peace-bliss-love",
  },
  {
    id: 86,
    name: "politics / economics /science",
    slug: "politics-economics",
  },
  {
    id: 83,
    name: "reality",
    slug: "reality",
  },
  {
    id: 60,
    name: "relationship / sexuality / jealousy",
    slug: "relationship-sexuality",
  },
  {
    id: 84,
    name: "spirituality / religion",
    slug: "spirituality-religion",
  },
  {
    id: 92,
    name: "state of the planet",
    slug: "state-of-the-planet",
  },
  {
    id: 94,
    name: "uplifting / fun",
    slug: "uplifting-fun",
  },
  {
    id: 77,
    name: "video",
    slug: "video",
  },
  {
    id: 79,
    name: "writings",
    slug: "writings",
  },
];

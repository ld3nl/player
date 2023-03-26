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

export const getAllPostsFromServer = async (
  term: number | null = null,
  per_page: number | null = null,
  offset: number | null = null
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
      }
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

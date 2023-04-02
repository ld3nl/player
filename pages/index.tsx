import Head from "next/head";
import { useEffect, useState, useContext } from "react";
import { GlobalContext } from "./_app";
import { GetStaticProps } from "next";
import LRUCache from "lru-cache";

import { getAllPostsFromServer, getCategoryCount } from "../lib/utils";
import AudioListing from "@/components/AudioListing/AudioListing";
import MainPlayer from "@/components/MainPlayer/MainPlayer";
import Icon from "@/components/Icon/Icon";
import Button from "@/components/Button/Button";

import css from "../styles/Home.module.scss";

type Post = {
  id: any;
  audioUrl: any;
  title: any;
  date: string;
};

type HomeProps = {
  posts: Post[];
  totalPosts: number;
};

const cache = new LRUCache({
  max: 500, // maximum number of entries
});

const DEFAULT_NUMBER_OF_POSTS = 12;

const useFilteredPosts = (posts: Post[], favoriteItems: number[]) => {
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);

  const filterPosts = (words: string[]): void => {
    setFilteredPosts(
      posts.filter((post) => {
        const title = post.title.rendered.toLowerCase();
        return (
          words.length > 0 &&
          words.every(
            (word) =>
              typeof word === "string" && title.includes(word.toLowerCase())
          )
        );
      })
    );
  };

  const filterFavorites = () => {
    if (favoriteItems.length > 0) {
      setFilteredPosts(posts.filter((post) => favoriteItems.includes(post.id)));
    } else {
      setFilteredPosts(posts);
    }
  };

  useEffect(() => {
    filterFavorites();
  }, [favoriteItems]);

  return { filteredPosts, filterPosts };
};

export default function Home({ posts, totalPosts }: HomeProps) {
  const [numberOfPost, setNumberOfPost] = useState<number>(
    DEFAULT_NUMBER_OF_POSTS
  );

  const { globalContext } = useContext(GlobalContext);

  const [favoriteItems, setFavoriteItems] = useState<number[]>(
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("favoriteItems") || "[]")
      : []
  );

  const { filteredPosts, filterPosts } = useFilteredPosts(posts, favoriteItems);

  const [showFavorite, setShowFavorite] = useState(false);

  useEffect(() => setShowFavorite(favoriteItems.length >= 1));

  return (
    <>
      <Head>
        <title>Paul Lowe Talks source paullowe.org</title>
        <meta name="description" content="Paul Lowe Talks" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={css["input-container"]}>
        <label htmlFor="numberOfPost">Number of posts:</label>
        <input
          id="numberOfPost"
          type="number"
          defaultValue={numberOfPost}
          onChange={(e) => setNumberOfPost(Number(e.target.value))}
        />
        <Button
          className={css.button}
          onClick={() => {
            setShowFavorite(!showFavorite);
            if (showFavorite) setFavoriteItems([]);
            else
              setFavoriteItems(
                typeof window !== "undefined"
                  ? JSON.parse(localStorage.getItem("favoriteItems") || "[]")
                  : []
              );
          }}
        >
          <Icon
            name={"Favorite"}
            size={"sm"}
            variation={showFavorite ? "active" : "default"}
          />
          <span>-</span>
          <span>
            {!showFavorite ? "Shows favorites items" : "Show all items"}
          </span>
        </Button>
      </div>

      <div className={css["input-container"]}>
        <label htmlFor="search">Search:</label>
        <input
          id="search"
          type="text"
          placeholder="Search"
          onChange={(e) => {
            if (showFavorite) setFavoriteItems([]);
            const string = e.target.value;
            const array = string.split(" ");
            filterPosts(array);
          }}
        />
      </div>

      {filteredPosts &&
        filteredPosts.slice(0, numberOfPost).map((post, i) => {
          const { audioUrl, title, date, id } = post;

          return (
            <div key={`item-${i}`}>
              <AudioListing
                title={title.rendered}
                src={`https://www.paullowe.org/wp-content/uploads/${audioUrl}`}
                date={date}
                id={id}
              />
            </div>
          );
        })}

      <MainPlayer {...globalContext.selectedItem} />
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const key = "posts";
  const cachedData = cache.get(key);

  if (cachedData) {
    console.log(`Cache hit for key: ${key}`);
    return { props: cachedData };
  }

  const categoriesCount = await getCategoryCount(80);
  const totalPosts = categoriesCount; // assuming total number of posts is the same as the total number of categories

  const numberOfRequests = Math.ceil(totalPosts / 99);
  const promises = [];

  for (let i = 0; i < numberOfRequests; i++) {
    const offset = i * 99;
    promises.push(getAllPostsFromServer(80, 99, offset));
  }

  const postsFromServer = await Promise.all(promises).then((results) =>
    results.flat().map(({ excerpt, title, date, id }) => {
      const pattern = /src="([^"]*)/;
      const match = excerpt.rendered.match(pattern);
      const audioUrl = match
        ? match[1].replace(
            /^(https?:\/\/)?(www\.)?paullowe\.org\/wp-content\/uploads\//,
            ""
          )
        : "";

      return {
        audioUrl: audioUrl,
        title,
        date,
        id,
      };
    })
  );

  const data = {
    posts: postsFromServer,
    totalPosts,
  };

  cache.set(key, { ...data }); // store the data in cache
  console.log(`Cache miss for key: ${key}`);

  return { props: data, revalidate: 7000 };
};

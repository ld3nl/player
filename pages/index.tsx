import { useEffect, useState, useContext, useCallback } from "react";
import { GetStaticProps } from "next";
import LRUCache from "lru-cache";
import Head from "next/head";

import AudioListing from "@/components/AudioListing/AudioListing";
import MainPlayer from "@/components/MainPlayer/MainPlayer";
import Icon from "@/components/Icon/Icon";
import Button from "@/components/Button/Button";

import { getAllPostsFromServer, getCategoryCount } from "../lib/utils";
import { useFilteredPosts } from "../lib/hooks";

import { GlobalContext } from "./_app";

import css from "../styles/Home.module.scss";

type Post = {
  id: number;
  audioUrl: string;
  title: string;
  date: string;
};

type HomeProps = {
  posts: Post[];
  totalPosts: number;
};

const cache = new LRUCache<string, HomeProps>({
  max: 500, // maximum number of entries
});

const DEFAULT_NUMBER_OF_POSTS = 12;

export default function Home({ posts, totalPosts }: HomeProps): JSX.Element {
  const [numberOfPosts, setNumberOfPosts] = useState<number>(
    DEFAULT_NUMBER_OF_POSTS
  );

  const { globalContext } = useContext(GlobalContext);

  const [favoriteItems, setFavoriteItems] = useState<number[]>(
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("favoriteItems") || "[]")
      : []
  );

  const { filteredPosts, filterPosts } = useFilteredPosts(posts, favoriteItems);

  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    setShowFavorites(favoriteItems.length > 0);
  }, [favoriteItems]);

  const handleShowFavoritesToggle = useCallback(() => {
    setShowFavorites((showFavorites) => !showFavorites);
    setFavoriteItems((favoriteItems) => (showFavorites ? [] : favoriteItems));
  }, [setShowFavorites, setFavoriteItems, showFavorites]);

  return (
    <>
      <Head>
        <title>Paul Lowe Talks source paullowe.org</title>
        <meta name="description" content="Paul Lowe Talks" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={css["input-container"]}>
        <label htmlFor="numberOfPosts">Number of posts:</label>
        <input
          id="numberOfPosts"
          type="number"
          defaultValue={numberOfPosts}
          onChange={(e) => setNumberOfPosts(Number(e.target.value))}
        />
        <Button className={css.button} onClick={handleShowFavoritesToggle}>
          <Icon
            name="Favorite"
            size="sm"
            variation={showFavorites ? "active" : "default"}
          />
          <span>-</span>
          <span>
            {!showFavorites ? "Show favorite items" : "Show all items"}
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
            if (showFavorites) setFavoriteItems([]);
            const searchString = e.target.value;
            const searchTerms = searchString.split(" ");
            filterPosts(searchTerms);
          }}
        />
      </div>

      {filteredPosts &&
        filteredPosts.slice(0, numberOfPosts).map((post, i) => {
          const { audioUrl, title, date, id } = post;

          return (
            <div key={`item-${i}`}>
              <AudioListing
                title={title}
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
        id,
        audioUrl: audioUrl,
        title: title.rendered,
        date,
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

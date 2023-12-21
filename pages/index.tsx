import React, { useEffect, useState, useContext } from "react";
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

export default function Home({ posts }: HomeProps): JSX.Element {
  const [numberOfPosts, setNumberOfPosts] = useState<number>(
    DEFAULT_NUMBER_OF_POSTS,
  );

  const [showFav, setShowFav] = useState<boolean>(false);
  const [favCTATriggered, setFavCTATriggered] = useState<boolean>(false);

  const [searchTerms, setSearchTerms] = useState<string[]>([]);

  const { globalContext } = useContext(GlobalContext);

  const [favoriteItems, setFavoriteItems] = useState<number[]>([]);

  const { filteredPosts, filterPosts } = useFilteredPosts(
    posts,
    showFav ? favoriteItems : [],
    searchTerms,
  );

  const [isScrolled, setIsScrolled] = useState(false);

  // Event handler for scroll event
  const handleScroll = () => {
    const top = window.scrollY < 10;
    setIsScrolled(!top);
  };

  // Set up the event listener for scrolling
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Function to update favoriteItems from localStorage
    const updateFavorites = () => {
      const storedFavorites = localStorage.getItem("favoriteItems");
      if (storedFavorites) {
        setFavoriteItems(JSON.parse(storedFavorites));
      } else {
        setFavoriteItems([]); // Reset to empty if nothing is found in localStorage
      }
    };

    // Call once to set initial state
    updateFavorites();

    // Optional: Set up a listener for changes in localStorage
    window.addEventListener("storage", (event) => {
      if (event.key === "favoriteItems") {
        updateFavorites();
      }
    });

    // Cleanup listener
    return () => {
      window.removeEventListener("storage", updateFavorites);
    };
  }, [showFav, favCTATriggered]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop === 0) {
        window.scrollTo(0, 1);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Input Handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target) return;

    const searchString = e.target.value.trim();
    const searchTerms = searchString.split(" ").filter((term) => term);
    console.log(searchTerms);
    setSearchTerms(searchTerms);
    filterPosts(searchTerms);
  };

  return (
    <>
      <Head>
        <title>Paul Lowe Talks source paullowe.org</title>
        <meta name="description" content="Paul Lowe Talks" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-full flex-col">
        <div
          className={[
            "sticky top-0 z-50 flex flex-col p-3 md:flex-row",
            "transition duration-300 ease-in-out",
            isScrolled
              ? "bg-white/50 shadow-lg backdrop-blur-sm backdrop-filter"
              : "dark:bg-gray-200",
          ].join(" ")}
        >
          <div className="mx-3 flex flex-col">
            <label htmlFor="numberOfPosts" className="text-gray-700">
              <span className="hidden md:inline">Number of posts:</span>
              <span className="md:hidden">Posts:</span>
            </label>
            <input
              className="form-input mt-1 block w-full md:w-20"
              id="numberOfPosts"
              type="number"
              defaultValue={numberOfPosts}
              onChange={(e) => setNumberOfPosts(Number(e.target.value))}
            />
          </div>
          <div className="mx-3 mt-3 flex flex-col md:mt-0">
            <label htmlFor="search" className="text-gray-700">
              <span className="hidden md:inline">Search:</span>
              <span className="md:hidden">Search:</span>
            </label>
            <input
              className="form-input mt-1 block w-full"
              id="search"
              type="text"
              placeholder="Search"
              onChange={handleSearchChange}
            />
          </div>

          <div className="mx-3 mt-3 flex justify-center md:mt-0">
            <Button
              className="form-input relative mt-auto flex w-full items-center justify-center pl-9"
              onClick={() => setShowFav(!showFav)}
            >
              <Icon
                className="absolute left-1"
                name="Favorite"
                size="sm"
                variation={showFav ? "active" : "default"}
                customVariation={{
                  active: "fill-purple-600",
                  default: "fill-white stroke-purple-600 stroke-2",
                }}
              />
              <span>
                <span className="hidden md:inline">
                  {!showFav ? "Show Favorite Items" : "Show All Items"}
                </span>
                <span className="md:hidden">
                  {!showFav ? "Favorites" : "All Items"}
                </span>
              </span>
            </Button>
          </div>
        </div>

        <div className="border border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
          {filteredPosts &&
            filteredPosts.slice(0, numberOfPosts).map((post, i) => {
              const { audioUrl, title, date, id } = post;

              return (
                <AudioListing
                  key={`item-${i}`}
                  title={title}
                  src={`https://www.paullowe.org/wp-content/uploads/${audioUrl}`}
                  date={date}
                  id={id}
                  favoriteCallback={() => {
                    setFavCTATriggered(!favCTATriggered);
                  }}
                />
              );
            })}
        </div>

        <MainPlayer {...globalContext.selectedItem} />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
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
            "",
          )
        : "";

      return {
        id,
        audioUrl: audioUrl,
        title: title.rendered,
        date,
      };
    }),
  );

  const data = {
    posts: postsFromServer,
    totalPosts,
  };

  cache.set(key, { ...data }); // store the data in cache
  console.log(`Cache miss for key: ${key}`);

  return { props: data, revalidate: 7000 };
};

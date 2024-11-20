"use client";
import { useEffect, useReducer, useState } from "react";
import he from "he";
// import Link from "next/link";
import {
  Headphones,
  Heart,
  CheckCircle,
  DotsThreeVertical,
} from "@phosphor-icons/react";

import { useGetMediaState } from "@/lib/hooks";

import Button from "@/components/Button/Button";
import MiniPlayer from "@/components/MiniPlayer/MiniPlayer";

// Type for the title object
type Title = {
  rendered: string;
};

// Type for the excerpt object
type Excerpt = {
  rendered: string;
  protected: boolean;
};

// Type for the main data structure
// Interface for the main data structure
interface PostData {
  date: string;
  slug: string;
  link: string;
  title: Title;
  excerpt: Excerpt;
}

const INITIAL_STATE_CATEGORY = {
  id: 0,
  title: "",
  slug: "",
  isFavorite: false,
};

function categoryReducer(state, action) {
  switch (action.type) {
    case "SET_SlUG":
      return { ...state, slug: action.payload };
    case "SET_TITLE":
      return { ...state, title: action.payload };
    case "TOGGLE_FAVORITE":
      return { ...state, isFavorite: !state.isFavorite };
    default:
      return state;
  }
}

// Component to list category audio posts
const CategoryAudioListing = ({
  posts,
  callback,
}: {
  posts: PostData[];
  // eslint-disable-next-line
  callback?: (val) => void;
}) => {
  const { mediaStates, updateMediaState } = useGetMediaState();

  const [state, dispatch] = useReducer(categoryReducer, INITIAL_STATE_CATEGORY);

  // use state for now
  const [moreOptions, setMoreOptions] = useState(false);
  const [moreOptionsAnimation, setMoreOptionAnimation] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMoreOptionAnimation(true);
    }, 300);
  }, [moreOptions]);

  const handleClick = (val: { slug: string; title: any }) => {
    dispatch({ type: "SET_SlUG", payload: val?.slug });
    dispatch({ type: "SET_TITLE", payload: val?.title.rendered });
    if (typeof callback === "function") {
      console.log(val);
      callback(val);
    }
  };

  const toggleFavorite = () =>
    // slug: number
    {
      // console.log("toggleFavorite", slug, state.slug);
      dispatch({ type: "TOGGLE_FAVORITE" });
      updateMediaState(
        state.slug,
        state.playedSeconds,
        state.duration,
        !state.isFavorite,
      );
    };

  return (
    <div>
      <ul>
        {state?.slug}
        <h1>{state?.title}</h1>
        {posts.map((post: PostData, index) => (
          // Each list item needs a unique key prop
          <li
            key={`${post.slug}${index}`}
            className="flex border-b-2 border-gray-400 p-3 font-sans text-gray-400"
          >
            <Button
              onClick={() =>
                handleClick({ slug: post.slug, title: post.title })
              }
              className="flex flex-col gap-0"
              ariaLabel="Toggle audio player"
            >
              <span className="text-sm font-bold">
                {he.decode(post.title.rendered)}
              </span>
              {/* Displaying icons and duration using @phosphor-icons/react */}
              <div className="flex items-center gap-1">
                <Headphones size={24} className="flex size-6" />
                <span className="text-xs">01:20:22</span>
                <CheckCircle size={24} className="flex size-6" />

                {mediaStates.some(
                  (val) => val.id === post.slug && val.isFavorite,
                ) ||
                (state.slug === post.slug && state.isFavorite) ? (
                  <Heart
                    size={24}
                    className="flex"
                    color="hotpink"
                    weight="fill"
                  />
                ) : (
                  <Heart
                    size={24}
                    className="flex"
                    color="hotpink"
                    weight={"thin"}
                  />
                )}
                {/* <Heart size={24} className="flex size-7" /> */}
              </div>
            </Button>
            <Button
              className="my-auto ms-auto"
              ariaLabel="More options"
              onClick={() => setMoreOptions(true)}
            >
              {" "}
              <DotsThreeVertical size={24} className="flex size-6" />
            </Button>
          </li>
        ))}
      </ul>

      <MiniPlayer slug={state.slug} title={state.title}>
        <Button
          ariaLabel="Play"
          className="flex aspect-square size-9 items-center justify-center rounded-full bg-white"
          onClick={
            () => toggleFavorite()
            // state.slug
          }
        >
          {state.isFavorite ? (
            <Heart size={18} color="hotpink" weight="fill" />
          ) : (
            <Heart size={18} color="hotpink" weight={"thin"} />
          )}
        </Button>
      </MiniPlayer>

      {moreOptions && (
        <div
          className="fixed inset-0 flex backdrop-blur-sm"
          onClick={() => setMoreOptions(false)}
        >
          <div
            className={`mt-auto h-40 w-full ${moreOptionsAnimation ? "translate-y-0" : "translate-y-full"} rounded-t-xl bg-black text-white transition-transform delay-300 `}
          >
            <ul>
              <li>option 1</li>
              <li>option 2</li>
              <li>option 3</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryAudioListing;

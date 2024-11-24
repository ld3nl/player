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
  id: number;
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
  loading: true,
};

interface CategoryState {
  id: number;
  title: string;
  slug: string;
  loading: boolean;
}

type CategoryAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ID"; payload: number }
  | { type: "SET_SLUG"; payload: string }
  | { type: "SET_TITLE"; payload: string };

function categoryReducer(
  state: CategoryState,
  action: CategoryAction,
): CategoryState {
  switch (action.type) {
    case "SET_ID":
      return { ...state, id: action.payload };
    case "SET_SLUG":
      return { ...state, slug: action.payload };
    case "SET_TITLE":
      return { ...state, title: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
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
  // eslint-disable-next-line no-unused-vars
  callback?: (val: any) => void;
}) => {
  const { mediaStates, updateMediaState } = useGetMediaState();

  const [state, dispatch] = useReducer(categoryReducer, INITIAL_STATE_CATEGORY);
  const [hasMounted, setHasMounted] = useState(false);

  // use state for now
  const [moreOptions, setMoreOptions] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleClick = (val: { slug: string; title: any; id: number }) => {
    dispatch({ type: "SET_LOADING", payload: true });

    setTimeout(() => {
      dispatch({ type: "SET_ID", payload: val?.id });
      dispatch({ type: "SET_SLUG", payload: val?.slug });
      dispatch({ type: "SET_TITLE", payload: val?.title.rendered });
      dispatch({ type: "SET_LOADING", payload: false });
    }, 300);

    if (typeof callback === "function") {
      callback(val);
    }
  };

  const toggleFavorite = () => {
    const isCurrentlyFavorite = mediaStates.some(
      (val) =>
        (val.id === state.id || val.slug === state.slug) && val.isFavorite,
    );
    updateMediaState({
      id: state.id,
      slug: state.slug,
      isFavorite: !isCurrentlyFavorite,
    });
  };

  return (
    <div>
      <ul className="overscroll-none">
        {state?.slug}
        <h1>{state?.title}</h1>
        {posts.map((post: PostData, index) => {
          return (
            // Each list item needs a unique key prop
            <li
              key={`${post.slug}${index}`}
              className="flex border-b-2 border-gray-400 p-3 font-sans text-gray-400"
            >
              <Button
                onClick={() =>
                  handleClick({
                    slug: post.slug,
                    title: post.title,
                    id: post.id,
                  })
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
                  {hasMounted && (
                    <Heart
                      size={24}
                      className="flex"
                      color="hotpink"
                      weight={
                        mediaStates.some(
                          (val) =>
                            (val.id === post.id || val.slug === post.slug) &&
                            val.isFavorite,
                        )
                          ? "fill"
                          : "thin"
                      }
                    />
                  )}
                </div>
              </Button>
              <Button
                className="my-auto ms-auto"
                ariaLabel="More options"
                onClick={() => setMoreOptions(true)}
                popoverTarget="popover-more-options"
              >
                {" "}
                <DotsThreeVertical size={24} className="flex size-6" />
              </Button>
            </li>
          );
        })}
      </ul>

      <MiniPlayer
        slug={state.slug}
        title={state.title}
        className={[
          `${!state.loading ? "translate-y-0" : "translate-y-full"}`,
          `transition-discrete starting:translate-y-0 transition-transform delay-100 duration-300`,
        ].join(" ")}
      >
        <Button
          ariaLabel="Favorite"
          className="ms-auto flex aspect-square size-9 items-center justify-center rounded-full bg-white"
          onClick={() => toggleFavorite()}
        >
          <Heart
            size={18}
            color="hotpink"
            weight={
              mediaStates.some(
                (val) =>
                  (val.id === state.id || val.slug === state.slug) &&
                  val.isFavorite,
              )
                ? "fill"
                : "thin"
            }
          />
        </Button>
      </MiniPlayer>

      {moreOptions && (
        <div
          popover={"auto"}
          id="popover-more-options"
          className={[
            "mt-auto h-40 w-full rounded-t-xl bg-black text-white backdrop:bg-black/20 backdrop:backdrop-blur-sm",
            "transition-discrete starting:open:translate-y-full  translate-y-full  transition-all duration-500 open:translate-y-0",
          ].join(" ")}
        >
          <ul>
            <li>option 1</li>
            <li>option 2</li>
            <li>option 3</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default CategoryAudioListing;

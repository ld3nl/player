import { HeartIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { cn } from "cnfast";
import { ViewTransition } from "react";
import AudioListing from "@/components/AudioListing/AudioListing";
import Button from "@/components/Button/Button";
import type { homePost, MediaState } from "@/lib/types";
import { get_empty_state, get_talk_title } from "./utils";

type TalkResultsProps = {
  posts: homePost[];
  visible_count: number;
  media_by_id: ReadonlyMap<number, MediaState>;
  show_favorites: boolean;
  has_filters: boolean;
  is_filtering: boolean;
  is_player_open: boolean;
  open_player: (post: homePost, saved: MediaState) => void;
  save_progress: (item: MediaState) => void;
  reset_filters: () => void;
};

// Results own row actions and empty-state recovery; filtering stays in the parent.
export const TalkResults = ({
  posts,
  visible_count,
  media_by_id,
  show_favorites,
  has_filters,
  is_filtering,
  is_player_open,
  open_player,
  save_progress,
  reset_filters,
}: TalkResultsProps) => (
  <ViewTransition
    default="none"
    update={is_player_open ? "none" : "catalog-results"}
  >
    <div
      aria-busy={is_filtering}
      className={cn("rounded-2xl border border-slate-200 bg-white p-2 sm:p-3")}
    >
      {posts.length > 0 ? (
        <ul aria-label={show_favorites ? "Favorite talks" : "Talks"}>
          {posts.slice(0, visible_count).map((post) => {
            const saved = media_by_id.get(post.id) ?? get_empty_state(post.id);
            return (
              <AudioListing
                key={post.id}
                title={post.title}
                date={post.date}
                categories={post.categories}
                link={post.link}
                playedSeconds={saved.playedSeconds}
                duration={saved.duration}
                setModalCallback={() => open_player(post, saved)}
              >
                <Button
                  onClick={() =>
                    save_progress({ ...saved, isFavorite: !saved.isFavorite })
                  }
                  aria-pressed={saved.isFavorite}
                  ariaLabel={`${saved.isFavorite ? "Remove" : "Add"} ${get_talk_title(post.title)} ${saved.isFavorite ? "from" : "to"} favorites`}
                  title={
                    saved.isFavorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                  className={cn("mr-1 sm:mr-2")}
                >
                  <HeartIcon
                    aria-hidden="true"
                    size={21}
                    weight={saved.isFavorite ? "fill" : "regular"}
                  />
                </Button>
              </AudioListing>
            );
          })}
        </ul>
      ) : (
        <div className={cn("mx-auto max-w-md px-4 py-16 text-center")}>
          {show_favorites ? (
            <HeartIcon
              size={36}
              aria-hidden="true"
              className={cn("mx-auto mb-5 text-purple-700")}
            />
          ) : (
            <MagnifyingGlassIcon
              size={36}
              aria-hidden="true"
              className={cn("mx-auto mb-5 text-slate-400")}
            />
          )}
          <h3 className={cn("text-xl font-semibold tracking-tight")}>
            {show_favorites && !has_filters
              ? "Keep a talk for another moment"
              : "No talks found"}
          </h3>
          <p className={cn("mt-3 text-sm leading-relaxed text-slate-600")}>
            {show_favorites && !has_filters
              ? "Tap the heart beside a talk to keep it here. Your favorites are saved in this browser."
              : "Try a different title, choose another category, or clear your filters."}
          </p>
          <Button
            onClick={reset_filters}
            variant="secondary"
            size="label"
            ariaLabel="Browse all talks"
            className={cn("mt-6")}
          >
            Browse all talks
          </Button>
        </div>
      )}
    </div>
  </ViewTransition>
);

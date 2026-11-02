"use client";

import { ArrowDownIcon, HeartIcon } from "@phosphor-icons/react";
import { cn } from "cnfast";
import {
  lazy,
  Suspense,
  startTransition,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import Button from "@/components/Button/Button";
import Header from "@/components/Header/Header";
import { TalkResults } from "@/components/Home/TalkResults";
import { get_empty_state, get_talk_title } from "@/components/Home/utils";
import { Welcome } from "@/components/Home/Welcome";
import { DEFAULT_MODAL, DEFAULT_NUMBER_OF_POSTS } from "@/lib/constants";
import { useGetMediaState } from "@/lib/hooks";
import type { HomeProps, homePost, MediaState, Modal } from "@/lib/types";
import { decode } from "he";

const MainPlayer = lazy(() => import("@/components/MainPlayer"));

// Browser-backed preferences enter only after the shared hydration snapshot.
const subscribe_hydration = () => () => {};
const get_client_snapshot = () => true;
const get_server_snapshot = () => false;

const Home = ({ posts, allCategories }: HomeProps) => {
  const { mediaStates, updateMediaState } = useGetMediaState();
  const is_hydrated = useSyncExternalStore(
    subscribe_hydration,
    get_client_snapshot,
    get_server_snapshot,
  );
  const [search, set_search] = useState("");
  const deferred_search = useDeferredValue(search);
  const [category, set_category] = useState<number | null>(null);
  const [show_favorites, set_show_favorites] = useState(false);
  const [visible_count, set_visible_count] = useState(DEFAULT_NUMBER_OF_POSTS);
  const [modal, set_modal] = useState<Modal>(DEFAULT_MODAL);
  const media_by_id = useMemo(
    () =>
      new Map(is_hydrated ? mediaStates.map((item) => [item.id, item]) : []),
    [mediaStates, is_hydrated],
  );
  const favorite_count = posts.filter(
    (post) => media_by_id.get(post.id)?.isFavorite,
  ).length;

  // Derived results avoid an extra effect/render and keep typing responsive.
  const filtered_posts = useMemo(() => {
    const terms = deferred_search
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return posts.filter(
      (post) =>
        (!show_favorites || media_by_id.get(post.id)?.isFavorite) &&
        (category === null ||
          post.categories.some((item) => item.id === category)) &&
        terms.every((term) => decode(post.title).toLowerCase().includes(term)),
    );
  }, [posts, deferred_search, category, show_favorites, media_by_id]);
  const is_filtering = search !== deferred_search;
  const has_filters = Boolean(search || category !== null);
  const featured_post = posts[0];
  const featured_state = featured_post
    ? (media_by_id.get(featured_post.id) ?? get_empty_state(featured_post.id))
    : null;

  const change_search = (value: string) => {
    set_search(value);
    set_visible_count(DEFAULT_NUMBER_OF_POSTS);
  };
  const change_category = (value: number | null) =>
    startTransition(() => {
      set_category(value);
      set_visible_count(DEFAULT_NUMBER_OF_POSTS);
    });
  const change_collection = (favorites: boolean) =>
    startTransition(() => {
      set_show_favorites(favorites);
      set_visible_count(DEFAULT_NUMBER_OF_POSTS);
    });
  const reset_filters = () =>
    startTransition(() => {
      set_search("");
      set_category(null);
      set_show_favorites(false);
      set_visible_count(DEFAULT_NUMBER_OF_POSTS);
    });
  const close_player = useCallback(() => set_modal(DEFAULT_MODAL), []);
  const save_progress = useCallback(
    (item: MediaState) =>
      updateMediaState(
        item.id,
        item.playedSeconds,
        item.duration,
        item.isFavorite,
      ),
    [updateMediaState],
  );

  const open_player = (post: homePost, saved: MediaState) => {
    set_modal({
      isModalActive: true,
      selectedItem: {
        title: get_talk_title(post.title),
        link: post.link,
        imageSrc: post.imageUrl,
        date: post.date,
        src: /^https?:\/\//.test(post.audioUrl)
          ? post.audioUrl
          : `https://www.paullowe.org/wp-content/uploads/${post.audioUrl}`,
        id: post.id,
        playedSeconds: saved.playedSeconds,
        duration: saved.duration,
        isFavorite: saved.isFavorite,
      },
    });
  };

  return (
    <div className={cn("min-h-full bg-slate-50 text-slate-900")}>
      {/* A quiet identity and one real listening invitation introduce the archive. */}
      <Welcome
        featured_post={featured_post}
        featured_state={featured_state}
        open_player={open_player}
      />

      {/* Browsing stays focused on titles; the filters remain within reach. */}
      <main
        id="talks"
        tabIndex={-1}
        className={cn(
          "mx-auto max-w-6xl scroll-mt-6 px-4 py-8 outline-none sm:px-8 sm:py-12 lg:px-12",
        )}
      >
        <div
          className={cn(
            "mb-6 flex flex-wrap items-center justify-between gap-5",
          )}
        >
          <div>
            <h2
              className={cn(
                "text-2xl font-semibold tracking-tight sm:text-3xl",
              )}
            >
              Explore the talks
            </h2>
            <p className={cn("mt-1.5 text-sm text-slate-500")}>
              Follow a subject, or see what catches your attention.
            </p>
          </div>
          <fieldset
            aria-label="Talk collection"
            className={cn(
              "flex rounded-full border border-slate-200 bg-white p-1",
            )}
          >
            <Button
              size="label"
              ariaLabel="All talks"
              aria-pressed={!show_favorites}
              onClick={() => change_collection(false)}
              className={cn("rounded-full")}
            >
              All talks
            </Button>
            <Button
              size="label"
              ariaLabel="Favorites"
              aria-pressed={show_favorites}
              onClick={() => change_collection(true)}
              className={cn("rounded-full")}
            >
              <HeartIcon
                size={19}
                weight={show_favorites ? "fill" : "regular"}
                aria-hidden="true"
              />
              Favorites{" "}
              <span className={cn("text-xs tabular-nums")}>
                {favorite_count}
              </span>
            </Button>
          </fieldset>
        </div>
        <Header
          search={search}
          category={category}
          categories={allCategories}
          change_search={change_search}
          change_category={change_category}
        />
        <div
          className={cn(
            "flex min-h-16 flex-wrap items-center justify-between gap-2 py-3",
          )}
        >
          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={cn("text-sm text-slate-500")}
          >
            {is_filtering
              ? "Finding talks…"
              : `${filtered_posts.length.toLocaleString("en-GB")} ${filtered_posts.length === 1 ? "talk" : "talks"}${show_favorites ? " in your favorites" : " to explore"}`}
          </p>
          {has_filters && (
            <Button
              size="label"
              ariaLabel="Reset filters"
              onClick={reset_filters}
            >
              Reset filters
            </Button>
          )}
        </div>
        <TalkResults
          posts={filtered_posts}
          visible_count={visible_count}
          media_by_id={media_by_id}
          show_favorites={show_favorites}
          has_filters={has_filters}
          is_filtering={is_filtering}
          is_player_open={modal.isModalActive}
          open_player={open_player}
          save_progress={save_progress}
          reset_filters={reset_filters}
        />
        {filtered_posts.length > 0 && (
          <div className={cn("flex flex-col items-center gap-4 pt-7")}>
            <p className={cn("text-xs tabular-nums text-slate-500")}>
              Showing {Math.min(visible_count, filtered_posts.length)} of{" "}
              {filtered_posts.length} talks
            </p>
            {visible_count < filtered_posts.length && (
              <Button
                variant="secondary"
                size="label"
                ariaLabel="Load more talks"
                onClick={() =>
                  startTransition(() =>
                    set_visible_count(
                      (count) => count + DEFAULT_NUMBER_OF_POSTS,
                    ),
                  )
                }
              >
                Load more talks
                <ArrowDownIcon size={18} aria-hidden="true" />
              </Button>
            )}
          </div>
        )}
      </main>
      <footer
        className={cn(
          "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 pb-8 pt-6 text-xs leading-relaxed text-slate-500 sm:px-8 lg:px-12",
        )}
      >
        <p>Paul Lowe Talks</p>
        <p>
          Audio from{" "}
          <a
            href="https://www.paullowe.org/"
            className={cn(
              "rounded underline decoration-slate-300 underline-offset-4 hover:text-purple-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-600",
            )}
          >
            paullowe.org
          </a>
          . Favorites and listening progress stay in this browser.
        </p>
      </footer>
      <Suspense
        fallback={
          <div
            role="status"
            className={cn(
              "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-white px-5 py-3 text-sm text-slate-700 shadow-lg",
            )}
          >
            Opening player…
          </div>
        }
      >
        {modal.isModalActive && modal.selectedItem && (
          <MainPlayer
            mediaItem={modal.selectedItem}
            closeModal={close_player}
            stateCallback={save_progress}
          />
        )}
      </Suspense>
    </div>
  );
};

export default Home;

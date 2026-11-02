import {
  ArrowDownIcon,
  ArrowSquareOutIcon,
  HeadphonesIcon,
  PlayIcon,
  WaveformIcon,
} from "@phosphor-icons/react";
import { cn } from "cnfast";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button/Button";
import type { homePost, MediaState } from "@/lib/types";
import { get_talk_title } from "./utils";

type WelcomeProps = {
  featured_post?: homePost;
  featured_state: MediaState | null;
  open_player: (post: homePost, saved: MediaState) => void;
};

// Keep the listening invitation and navigation separate from catalog state.
export const Welcome = ({
  featured_post,
  featured_state,
  open_player,
}: WelcomeProps) => (
  <header className={cn("bg-white")}>
    <nav
      aria-label="Main navigation"
      className={cn(
        "mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-6 lg:px-12",
      )}
    >
      <Link
        href="/"
        aria-label="Paul Lowe Talks home"
        className={cn(
          "flex min-h-11 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-600",
        )}
      >
        <span
          className={cn(
            "grid size-11 place-items-center rounded-full bg-purple-50 text-purple-700",
          )}
        >
          <WaveformIcon size={25} weight="bold" aria-hidden="true" />
        </span>
        <span className={cn("text-lg font-semibold tracking-tight")}>
          Paul Lowe{" "}
          <span className={cn("font-normal text-slate-500")}>Talks</span>
        </span>
      </Link>
      <a
        href="https://www.paullowe.org/"
        target="_blank"
        rel="noopener noreferrer"
        className={cn("ui-control")}
        data-size="label"
        aria-label="About Paul (opens in a new tab)"
      >
        <span>About Paul</span>
        <ArrowSquareOutIcon size={17} aria-hidden="true" />
      </a>
    </nav>
    <section
      aria-labelledby="welcome-title"
      className={cn(
        "mx-auto grid max-w-6xl gap-10 px-5 pb-10 pt-6 sm:px-8 sm:pb-16 sm:pt-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-12 lg:pb-20 lg:pt-12",
      )}
    >
      <div>
        <h1
          id="welcome-title"
          className={cn(
            "max-w-lg text-5xl font-medium leading-tight tracking-tighter text-slate-900 sm:text-6xl lg:text-7xl",
          )}
        >
          Come back to the present.
        </h1>
        <p
          className={cn(
            "mt-6 max-w-sm text-base leading-relaxed text-slate-600 sm:text-lg",
          )}
        >
          Conversations with Paul Lowe on awareness, relationships and everyday
          life. Find a talk. Take your time.
        </p>
        <a
          href="#talks"
          className={cn("ui-control mt-7")}
          data-variant="secondary"
          data-size="label"
        >
          <HeadphonesIcon size={21} aria-hidden="true" />
          Explore the talks
          <ArrowDownIcon size={17} aria-hidden="true" />
        </a>
      </div>
      {featured_post && featured_state && (
        <div className={cn("overflow-hidden rounded-3xl bg-slate-50")}>
          <div className={cn("relative aspect-video overflow-hidden")}>
            <Image
              src="/IMG_0987_low_website.jpg"
              alt="Sunlight falling across a quiet, rocky shoreline"
              fill
              sizes="(min-width: 1024px) 480px, (min-width: 640px) 640px, 100vw"
              preload
              className={cn("object-cover")}
            />
          </div>
          <div className={cn("flex items-center gap-4 p-5 sm:p-6")}>
            <Button
              variant="primary"
              ariaLabel={`${featured_state.playedSeconds > 0 ? "Resume" : "Play"} featured talk: ${get_talk_title(featured_post.title)}`}
              onClick={() => open_player(featured_post, featured_state)}
            >
              <PlayIcon
                size={20}
                weight="fill"
                aria-hidden="true"
                className={cn("ml-0.5")}
              />
            </Button>
            <div className={cn("min-w-0")}>
              <p className={cn("mb-1 text-xs font-medium text-slate-500")}>
                Start listening
              </p>
              <h2
                className={cn(
                  "text-base font-semibold leading-snug tracking-tight sm:text-lg",
                )}
              >
                {get_talk_title(featured_post.title)}
              </h2>
            </div>
          </div>
        </div>
      )}
    </section>
  </header>
);

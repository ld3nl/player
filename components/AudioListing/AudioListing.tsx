import { Button as HeadlessButton } from "@headlessui/react";
import { PlayIcon } from "@phosphor-icons/react";
import { cn } from "cnfast";
import { decode } from "he";
import { Duration } from "@/components/MainPlayer/Duration";
import type { AudioListingProps } from "@/lib/types";

// A single continuous list keeps long titles readable and topics easy to scan.
const AudioListing = ({
  title,
  date,
  categories = [],
  setModalCallback,
  children,
  playedSeconds,
  duration,
}: AudioListingProps) => {
  const has_progress =
    Number.isFinite(duration) && duration > 0 && playedSeconds > 0;
  const progress = has_progress
    ? Math.min(100, Math.max(0, (playedSeconds / duration) * 100))
    : 0;
  const publish_date = new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const talk_title = decode(title).replace(/\s*\(audio\)\s*$/i, "");

  return (
    <li
      className={cn(
        "group flex items-center gap-1 border-b border-slate-200 py-2 first:pt-0 last:border-0 last:pb-0 sm:gap-4",
      )}
    >
      <div
        className={cn(
          "relative flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-4 transition-colors hover:bg-slate-50 motion-reduce:transition-none sm:gap-5 sm:px-4 sm:py-5",
        )}
      >
        {/* The overlay keeps the heading semantic and the save button independent. */}
        <HeadlessButton
          type="button"
          onClick={setModalCallback}
          aria-label={`${has_progress && progress < 100 ? "Resume" : "Play"} ${talk_title}`}
          className={cn(
            "absolute inset-0 w-full cursor-pointer rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 data-focus:outline-solid data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-purple-600",
          )}
        />
        <span
          className={cn(
            "pointer-events-none grid size-11 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 transition-colors group-hover:bg-purple-100 group-hover:text-purple-700 motion-reduce:transition-none",
          )}
        >
          <PlayIcon
            size={18}
            weight="fill"
            aria-hidden="true"
            className={cn("ml-0.5")}
          />
        </span>
        <div className={cn("min-w-0 flex-1")}>
          <h3
            className={cn(
              "text-base font-semibold leading-snug tracking-tight text-slate-900 sm:text-lg",
            )}
          >
            {talk_title}
          </h3>
          {categories.length > 0 && (
            <p className={cn("mt-1.5 text-sm leading-relaxed text-slate-500")}>
              {categories
                .map((item) => decode(item.name).replaceAll("/", " / "))
                .join(", ")}
            </p>
          )}
          <time
            dateTime={date}
            className={cn("mt-2 block text-xs text-slate-500 sm:hidden")}
          >
            {publish_date}
          </time>
          {has_progress && (
            <div className={cn("mt-3 flex max-w-sm items-center gap-3")}>
              <div
                className={cn(
                  "h-1 flex-1 overflow-hidden rounded-full bg-slate-200",
                )}
                aria-hidden="true"
              >
                <div
                  className={cn("h-full rounded-full bg-purple-700")}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span
                className={cn("shrink-0 text-xs tabular-nums text-slate-500")}
              >
                {progress >= 99.5 ? (
                  "Finished"
                ) : (
                  <>
                    <Duration seconds={Math.max(0, duration - playedSeconds)} />{" "}
                    left
                  </>
                )}
              </span>
            </div>
          )}
        </div>
        <time
          dateTime={date}
          className={cn("hidden shrink-0 text-sm text-slate-500 sm:block")}
        >
          {publish_date}
        </time>
      </div>
      {children}
    </li>
  );
};

export default AudioListing;

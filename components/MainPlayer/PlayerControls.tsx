import { Select } from "@headlessui/react";
import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  ArrowSquareOutIcon,
  HeartIcon,
  PauseIcon,
  PlayIcon,
} from "@phosphor-icons/react";
import { cn } from "cnfast";
import ReactSlider from "react-slider";
import Button from "@/components/Button/Button";
import { Duration } from "./Duration";
import type { usePlayerPlayback } from "./hooks";

type PlayerControlsProps = Pick<
  ReturnType<typeof usePlayerPlayback>,
  | "state"
  | "change_seek"
  | "finish_seek"
  | "skip_media"
  | "toggle_playback"
  | "toggle_favorite"
  | "change_rate"
> & { link?: string };

export const PlayerControls = ({
  state,
  link,
  change_seek,
  finish_seek,
  skip_media,
  toggle_playback,
  toggle_favorite,
  change_rate,
}: PlayerControlsProps) => (
  <div className={cn("px-5 pb-6 sm:px-8")}>
    <div className={cn("w-full")}>
      <ReactSlider
        ariaLabel="Playback position"
        ariaValuetext={({ valueNow }) =>
          `${Math.floor((state.duration * valueNow) / 100)} of ${Math.floor(state.duration)} seconds`
        }
        value={state.played * 100}
        step={0.1}
        onChange={(value) => change_seek(value / 100)}
        onAfterChange={(value) => finish_seek(value / 100)}
        className={cn("player-timeline")}
        thumbClassName="player-timeline-thumb"
        trackClassName="player-timeline-track"
        renderTrack={({ key, style, ...props }) => (
          <div
            key={key}
            {...props}
            style={{
              ...style,
              // ReactSlider positions tracks at the thumb's leading edge.
              // Inset both ends by half the 44px target to meet its center.
              left: Number(style?.left ?? 0) + 22,
              right: Number(style?.right ?? 0) + 22,
            }}
          />
        )}
      />
      <div
        className={cn(
          "mx-[22px] flex justify-between text-xs font-medium tabular-nums text-slate-500",
        )}
      >
        <span>
          <span className={cn("sr-only")}>Elapsed: </span>
          <Duration seconds={state.duration * state.played} />
        </span>
        <span>
          <span className={cn("sr-only")}>Remaining: </span>
          −<Duration seconds={state.duration * (1 - state.played)} />
        </span>
      </div>
    </div>

    <div className={cn("flex items-center justify-center gap-7 py-5")}>
      <Button
        onClick={() => skip_media("backward", 15)}
        ariaLabel="Rewind 15 seconds"
      >
        <span
          className={cn("relative grid size-9 place-items-center")}
          aria-hidden="true"
        >
          <ArrowCounterClockwiseIcon focusable="false" size={36} />
          <span
            className={cn(
              "absolute inset-0 grid translate-y-px place-items-center text-[11px] font-bold leading-none tabular-nums",
            )}
          >
            15
          </span>
        </span>
      </Button>
      <Button
        onClick={toggle_playback}
        variant="primary"
        size="play"
        ariaLabel={state.playing ? "Pause" : "Play"}
      >
        {state.playing ? (
          <PauseIcon
            aria-hidden="true"
            focusable="false"
            size={30}
            weight="fill"
          />
        ) : (
          <PlayIcon
            aria-hidden="true"
            focusable="false"
            size={30}
            weight="fill"
            className={cn("ml-1")}
          />
        )}
      </Button>
      <Button
        onClick={() => skip_media("forward", 15)}
        ariaLabel="Forward 15 seconds"
      >
        <span
          className={cn("relative grid size-9 place-items-center")}
          aria-hidden="true"
        >
          <ArrowClockwiseIcon focusable="false" size={36} />
          <span
            className={cn(
              "absolute inset-0 grid translate-y-px place-items-center text-[11px] font-bold leading-none tabular-nums",
            )}
          >
            15
          </span>
        </span>
      </Button>
    </div>

    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 pt-4",
      )}
    >
      <Button
        onClick={toggle_favorite}
        variant="secondary"
        size="label"
        ariaLabel={
          state.isFavorite ? "Remove from favorites" : "Add to favorites"
        }
        title={state.isFavorite ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={state.isFavorite}
      >
        <HeartIcon
          aria-hidden="true"
          focusable="false"
          size={22}
          weight={state.isFavorite ? "fill" : "regular"}
        />
        <span>{state.isFavorite ? "Favorited" : "Favorite"}</span>
      </Button>
      <Select
        aria-label="Playback speed"
        value={state.playbackRate}
        onChange={(event) => change_rate(Number(event.target.value))}
        className={cn(
          "catalog-field w-24 cursor-pointer py-2 pl-3 pr-8 text-sm",
        )}
      >
        {[0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
          <option key={rate} value={rate}>
            {rate}×
          </option>
        ))}
      </Select>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("ui-control")}
          data-size="label"
          data-variant="ghost"
          aria-label="View talk on Paul Lowe’s website (opens in a new tab)"
          title="View talk (opens in a new tab)"
        >
          <ArrowSquareOutIcon aria-hidden="true" focusable="false" size={22} />
          <span>View talk</span>
        </a>
      )}
    </div>
  </div>
);

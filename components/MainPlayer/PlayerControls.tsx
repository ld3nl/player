import ReactSlider from "react-slider";
import Button from "@/components/Button/Button";
import Icon from "@/components/Icon/Icon";
import { SVGIconName } from "@/lib/types";
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
> & { link?: string };

// Render seeking, transport, and favorite controls once duration is known.
export const PlayerControls = ({
  state,
  link,
  change_seek,
  finish_seek,
  skip_media,
  toggle_playback,
  toggle_favorite,
}: PlayerControlsProps) => (
  <>
    <div className="w-full space-y-2">
      <div className="w-full">
        <ReactSlider
          ariaLabel="Playback position"
          value={state.played * 100}
          step={0.000001}
          onChange={(value) => change_seek(value / 100)}
          onAfterChange={(value) => finish_seek(value / 100)}
          className="mx-10 h-1 cursor-pointer rounded-full bg-gray-300"
          thumbClassName="absolute -top-1 w-3 h-3 bg-purple-600 rounded-full shadow-lg cursor-grab"
          trackClassName="h-1 bg-purple-600 rounded-full bg-track-custom"
        />
      </div>
      <div className="mx-10 flex justify-between text-xs text-gray-400">
        <Duration seconds={state.duration * state.played} />
        <Duration seconds={state.duration * (1 - state.played)} />
      </div>
    </div>

    <div className="flex items-center justify-center p-4">
      <div className="flex items-center space-x-6">
        <Button
          onClick={() => skip_media("backward", 15)}
          className="flex size-8 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-700"
          ariaLabel="Rewind 15 seconds"
        >
          <Icon name={SVGIconName.BackwardRewind} size="twoThirds" />
        </Button>
        <Button
          onClick={toggle_playback}
          className="mx-2 flex size-12 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-700"
          ariaLabel={state.playing ? "Pause" : "Play"}
        >
          <Icon
            name={state.playing ? SVGIconName.Pause : SVGIconName.Play}
            size="md"
          />
        </Button>
        <Button
          onClick={() => skip_media("forward", 15)}
          className="flex size-8 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-700"
          ariaLabel="Fast forward 15 seconds"
        >
          <Icon name={SVGIconName.ForwardRewind} size="twoThirds" />
        </Button>
      </div>
    </div>

    <div className="mt-2 flex items-center justify-center">
      <button
        type="button"
        onClick={toggle_favorite}
        aria-label={
          state.isFavorite ? "Remove from favorites" : "Add to favorites"
        }
        aria-pressed={state.isFavorite}
        className="flex size-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
      >
        <Icon
          name={SVGIconName.Favorite}
          size="sm"
          variation={state.isFavorite ? "active" : "default"}
          customVariation={{
            active: "fill-purple-600",
            default: "fill-white stroke-purple-600 stroke-2",
          }}
        />
      </button>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="ms-8 flex size-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
        aria-label="Open link in new tab"
      >
        <Icon
          name={SVGIconName.Link}
          size="twoThirds"
          customVariation={{
            active: "fill-purple-600",
            default: "fill-purple-600",
          }}
        />
      </a>
    </div>
  </>
);

import FocusTrap from "focus-trap-react";
import { decode } from "he";
import Button from "@/components/Button/Button";
import Icon from "@/components/Icon/Icon";
import { SVGIconName } from "@/lib/types";
import type { PlayerProps } from "@/lib/types";
import { usePlayerModal, usePlayerPlayback } from "./hooks";
import { PlayerControls } from "./PlayerControls";
import { PlayerMedia } from "./PlayerMedia";

// Compose the modal shell from focused playback, lifecycle, and UI modules.
const MainPlayer = ({ mediaItem, closeModal, stateCallback }: PlayerProps) => {
  const playback = usePlayerPlayback(mediaItem, stateCallback);
  const { state, dispatch } = playback;
  const { playerRef, isDelayingOpen, close_player } = usePlayerModal(
    mediaItem,
    state.isOpen,
    state.isAnimatingOut,
    dispatch,
    closeModal,
  );
  const isVisible =
    state.isOpen || state.isAnimatingOut || isDelayingOpen || state.id !== 0;

  return (
    <FocusTrap active={state.isOpen}>
      {isVisible && (
        <div
          className={[
            "flex flex-col items-center justify-center",
            "z-50 bg-black/50 backdrop-blur-lg backdrop-filter",
            "fixed left-0 top-0 h-full w-full",
            "transition-all duration-500 ease-in-out",
            state.isOpen && !state.isAnimatingOut
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0",
          ].join(" ")}
          ref={playerRef}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          aria-label={
            mediaItem.title ? decode(mediaItem.title) : "Audio player"
          }
        >
          <div className="absolute left-0 top-0 z-50 w-full bg-black/50">
            <Button
              className="absolute right-0 top-0 w-12 p-3 text-white"
              onClick={close_player}
              ariaLabel="Close"
            >
              <Icon name={SVGIconName.Close} />
            </Button>
          </div>

          <PlayerMedia mediaItem={mediaItem} {...playback} />
          {state.duration !== 0 ? (
            <PlayerControls link={mediaItem.link} {...playback} />
          ) : (
            <div className="flex p-10">
              <Icon
                name={SVGIconName.Spinner}
                customVariation={{
                  active: "fill-purple-600",
                  default: "fill-purple-600",
                }}
              />
            </div>
          )}
        </div>
      )}
    </FocusTrap>
  );
};

export default MainPlayer;

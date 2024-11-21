"use client"; // Ensures this is a client-side component in Next.js

import {
  FC,
  useEffect,
  useState,
  useCallback,
  useMemo,
  lazy,
  useReducer,
  startTransition,
} from "react";
import Image from "next/image";
import he from "he";
import ReactSlider from "react-slider";
import debounce from "lodash/debounce"; // Ensure correct lodash import

import useLockScroll from "@/lib/hooks"; // Custom hook for locking scroll when modal is active
import {
  PlayerProps,
  SVGIconName,
  PlayerState,
  PlayerAction,
} from "@/lib/types"; // Types for props and SVG icon names

import { INITIAL_STATE } from "@/lib/constants"; // Initial state for the player

import type { default as ReactPlayerType } from "react-player"; // Add type import
const ReactPlayer = lazy(() => import("react-player")); // Lazy load the ReactPlayer component
import FocusTrap from "focus-trap-react"; // Focus trap for handling keyboard focus inside the modal

import Icon from "@/components/Icon/Icon"; // Reusable Icon component
import Button from "@/components/Button/Button"; // Reusable Button component

import { Duration } from "./Duration"; // Custom component to display audio duration

// React does not recognize the `fetchPriority` prop on a DOM element.
// If you want it in the DOM, spell it as lowercase `fetchpriority`.
import img from "@/public/P1080841.jpg"; // Fallback image if no image source is provided
import Link from "next/link";

// Reducer function to handle state transitions
function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "SET_PLAYING":
      return { ...state, playing: action.payload };
    case "SET_PLAYED_SECONDS":
      return { ...state, playedSeconds: action.payload };
    case "SET_VOLUME":
      return { ...state, volume: action.payload };
    case "TOGGLE_FAVORITE":
      return { ...state, isFavorite: !state.isFavorite };
    case "SEEK":
      return { ...state, played: action.payload };
    case "SET_DURATION":
      return { ...state, duration: action.payload };
    case "TOGGLE_MODAL":
      return { ...state, isOpen: action.payload };
    case "CLOSE_MODAL":
      return { ...state, isOpen: false, isAnimatingOut: true };
    case "ANIMATE_OUT":
      return { ...state, isAnimatingOut: action.payload };
    default:
      return state;
  }
}

const MainPlayer: FC<PlayerProps> = ({
  mediaItem,
  closeModal,
  stateCallback,
}) => {
  // Destructure media item properties for easier access
  const {
    title,
    src,
    id,
    link,
    imageSrc,
    playedSeconds,
    duration,
    isFavorite,
  } = mediaItem;

  const [state, dispatch] = useReducer(playerReducer, {
    ...INITIAL_STATE,
    id: id || 0,
    playedSeconds: playedSeconds || 0,
    duration: duration || 0,
    isFavorite: isFavorite || false,
  });

  // Update ref handling
  const [audioElement, setAudioElement] = useState<ReactPlayerType | null>(
    null,
  );

  const audioRefCallback = useCallback((element: ReactPlayerType | null) => {
    setAudioElement(element);
    return () => setAudioElement(null);
  }, []);

  // Replace player ref usage
  const player = audioElement;

  // Optional: Add type guard for safer ref usage
  const isReactPlayer = (ref: any): ref is ReactPlayerType => {
    return ref && typeof ref.seekTo === "function";
  };

  // Manage server-side rendering (SSR) issues
  const [isSSR, setIsSSR] = useState(true);
  useEffect(() => setIsSSR(false), []);

  // Lock the scroll when the modal is open
  useLockScroll(state.isOpen);

  // Function: Handles opening the modal with a short delay
  const handleOpen = useCallback(() => {
    setIsDelayingOpen(true);
    setTimeout(() => {
      setIsDelayingOpen(false); // Delay to allow for smooth rendering
    }, 10);
  }, []);

  // Effect: Handles opening the modal when title and src are available
  useEffect(() => {
    if (title && src) {
      dispatch({ type: "TOGGLE_MODAL", payload: true });
      handleOpen();
    }
  }, [title, src, handleOpen]);

  // Handle modal close with animation
  const handleClose = useCallback(() => {
    dispatch({ type: "ANIMATE_OUT", payload: true });

    setTimeout(() => {
      dispatch({ type: "TOGGLE_MODAL", payload: false });
      dispatch({ type: "ANIMATE_OUT", payload: false }); // Reset animation state
      typeof closeModal === "function" && closeModal?.();
    }, 500); // Animation duration for closing
  }, [closeModal]); // Add closeModal as a dependency if needed

  // Memoize handleStop to use in useEffect
  const handleStop = useCallback(() => {
    dispatch({ type: "SET_PLAYING", payload: false });
  }, []);

  // Close modal on Escape key press
  useEffect(() => {
    if (!state.isOpen) {
      if (isReactPlayer(player)) {
        handleStop(); // Stop playback if modal closes
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose(); // Close modal when Escape is pressed
      }
    };

    if (state.isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (state.isOpen) {
        window.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [state.isOpen, handleClose, handleStop, player, isReactPlayer]); // Dependencies ensure proper execution

  // Handle modal open with a delay for smooth rendering
  const [isDelayingOpen, setIsDelayingOpen] = useState(false);

  // Seek forward or backward by a specified number of seconds
  const handleSeekTo = useCallback(
    (action: "backward" | "forward", seconds: number) => {
      if (!state.duration) return;
      const sec = seconds / state.duration;
      const seekTo =
        action === "backward"
          ? Math.max(state.played - sec, 0)
          : state.played + sec;
      dispatch({ type: "SEEK", payload: seekTo });

      // Safer ref usage with type guard

      if (isReactPlayer(player)) {
        player.seekTo(seekTo);
      }
    },
    [state.duration, state.played],
  );

  // Handle playback stop
  // const handleStop = () => {
  //   dispatch({ type: "SET_PLAYING", payload: false });
  // };

  // Handle playback toggle between play/pause
  const handlePlay = () => {
    dispatch({ type: "SET_PLAYING", payload: true });
  };

  const handlePlayPause = () => {
    dispatch({ type: "SET_PLAYING", payload: !state.playing });
  };

  // Handle change in seek progress
  const handleSeekChange = debounce((value: number) => {
    dispatch({ type: "SEEK", payload: value });
    if (isReactPlayer(player)) {
      player?.seekTo(parseFloat(value.toString()));
    }
  }, 300);

  // Handle when the user stops seeking
  const handleSeekMouseUp = (newValue: number) => {
    dispatch({ type: "SEEK", payload: newValue });

    if (isReactPlayer(player)) {
      player.seekTo(parseFloat(newValue.toString())); // Ensure valid number
    }
  };

  // Debounce state update to avoid frequent calls
  const debouncedUpdate = useMemo(
    () =>
      debounce((newState) => {
        stateCallback?.(newState); // Call state update callback
      }, 300),
    [stateCallback],
  );

  // Toggle favorite state of the media item
  const toggleFavorite = useCallback(() => {
    dispatch({ type: "TOGGLE_FAVORITE" });

    debouncedUpdate({
      ...{
        id: state.id,
        playedSeconds: state.playedSeconds,
        duration: state.duration,
      },
      isFavorite: !state.isFavorite,
    });
  }, [state, debouncedUpdate]);

  const handleProgress = useCallback(
    (updatedState: { played: number; playedSeconds: number }) => {
      const { played, playedSeconds } = updatedState;
      dispatch({ type: "SEEK", payload: played });
      dispatch({ type: "SET_PLAYED_SECONDS", payload: playedSeconds });

      if (!state.seeking) {
        startTransition(() => {
          debouncedUpdate({
            ...state,
            playedSeconds: playedSeconds,
          });
        });
      }
    },
    [state, debouncedUpdate],
  );

  // Handle when the media's total duration is available
  const handleDuration = useCallback(
    (duration: number) => {
      dispatch({ type: "SET_DURATION", payload: duration });
      if (isReactPlayer(player)) {
        player?.seekTo(state.playedSeconds, "seconds");
      }
    },
    [state.playedSeconds],
  );

  return (
    <FocusTrap active={state.isOpen}>
      {(state.isOpen ||
        state.isAnimatingOut ||
        isDelayingOpen ||
        state?.id !== 0) && (
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
          tabIndex={0}
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          {typeof closeModal !== "function" ? (
            <div className="absolute right-0 top-0 z-50 w-full bg-black/50">
              <Link href="/">
                <Button
                  className="absolute left-0 top-0 w-12 p-3 text-white"
                  ariaLabel="Go Back"
                >
                  <Icon name={SVGIconName.ArrowLeft} />
                </Button>
              </Link>
            </div>
          ) : (
            <div className={`absolute left-0 top-0 z-50 w-full bg-black/50`}>
              <Button
                className="absolute right-0 top-0 w-12 p-3 text-white"
                onClick={handleClose}
                ariaLabel="Close"
              >
                <Icon name={SVGIconName.Close} />
              </Button>
            </div>
          )}

          {/* Media Image */}
          <div className="mx-auto flex w-96">
            <Image
              src={
                imageSrc
                  ? `https://www.paullowe.org/wp-content/uploads/${imageSrc}`
                  : img
              }
              width={imageSrc ? 400 : undefined}
              height={imageSrc ? 400 : undefined}
              alt={"Nature Beach"}
              className="h-auto w-full object-cover"
            />
          </div>

          {/* Media Title */}
          {state?.duration !== 0 && (
            <span className="my-3 block text-center text-sm text-gray-200">
              {title ? he.decode(title) : ""}
            </span>
          )}

          {/* Media Player */}
          {isSSR ? null : (
            <ReactPlayer
              ref={audioRefCallback}
              style={{ display: "none" }}
              url={src}
              pip={state.pip}
              playing={state.playing}
              controls={state.controls}
              light={state.light}
              loop={state.loop}
              playbackRate={state.playbackRate}
              volume={state.volume}
              muted={state.muted}
              onPlay={handlePlay}
              onProgress={handleProgress}
              onDuration={handleDuration}
            />
          )}

          {/* Slider for seeking */}
          {state?.duration !== 0 && (
            <div className="w-full space-y-2">
              <div className="w-full">
                <ReactSlider
                  value={state.played * 100}
                  step={0.000001}
                  onChange={(e) => handleSeekChange(e / 100)}
                  onAfterChange={(e) => handleSeekMouseUp(e / 100)}
                  className="mx-10 h-1 cursor-pointer rounded-full bg-gray-300"
                  thumbClassName="absolute -top-1 w-3 h-3 bg-purple-600 rounded-full shadow-lg cursor-grab"
                  trackClassName="h-1 bg-purple-600 rounded-full bg-track-custom"
                />
              </div>

              <div className="mx-10 flex justify-between text-xs text-gray-400">
                <Duration seconds={state?.duration * state.played} />
                <Duration seconds={state?.duration * (1 - state.played)} />
              </div>
            </div>
          )}

          {/* Play/Pause and Seek buttons */}
          {state?.duration !== 0 && (
            <div className="flex items-center justify-center p-4">
              <div className="flex items-center space-x-6">
                <Button
                  onClick={() => handleSeekTo("backward", 15)}
                  className="flex size-8 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-700"
                  ariaLabel="Rewind 15 seconds"
                >
                  <Icon name={SVGIconName.BackwardRewind} size="twoThirds" />
                </Button>

                <Button
                  onClick={handlePlayPause}
                  className="mx-2 flex size-12 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-700"
                  ariaLabel={state.playing ? "Pause" : "Play"}
                >
                  <Icon
                    name={state.playing ? SVGIconName.Pause : SVGIconName.Play}
                    size={"md"}
                  />
                </Button>

                <Button
                  onClick={() => handleSeekTo("forward", 15)}
                  className="flex size-8 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-700"
                  ariaLabel="Fast forward 15 seconds"
                >
                  <Icon name={SVGIconName.ForwardRewind} size="twoThirds" />
                </Button>
              </div>
            </div>
          )}

          {/* Favorite and Link buttons */}
          {state?.duration !== 0 && (
            <div className="mt-2 flex items-center justify-center">
              <button
                onClick={() => toggleFavorite()}
                className="flex size-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
              >
                <Icon
                  name={SVGIconName.Favorite}
                  size={"sm"}
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
                className="ms-8 flex size-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                aria-label="Open link in new tab"
                data-testid={link}
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
              {id && (
                <Link
                  href={`/media/${id}`}
                  className="ms-8 flex size-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  <Icon
                    name={SVGIconName.LinkSimple}
                    size="twoThirds"
                    customVariation={{
                      active: "fill-purple-600",
                      default: "fill-purple-600",
                    }}
                  />
                </Link>
              )}
            </div>
          )}

          {/* Spinner icon when loading */}
          {state?.duration === 0 && (
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

/**
 * Possible Refactoring Ideas:
 * 1. **Performance Optimization**: Consider using `useTransition` or `Suspense` for smoother UI transitions during state changes or lazy loading.
 * 2. **Lazy Load More Components**: Lazy load components like `FocusTrap`, `ReactSlider` for further performance improvement.
 * 3. **Debounced Volume/Seek Updates**: Enhance the debouncing of state updates like volume, seeking, and playback rate to prevent performance hits from frequent updates.
 * 4. **Accessibility Improvements**: Ensure full keyboard navigation, aria-labels, and modal focus handling are properly tested and optimized.
 * 5. **TypeScript Enhancements**: Strengthen type safety by defining clearer types for state management and callback functions.
 */

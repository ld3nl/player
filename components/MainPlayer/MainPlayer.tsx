import {
  FC,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  lazy,
} from "react";
import Image from "next/image";
import he from "he";
import ReactSlider from "react-slider";
import debounce from "lodash/debounce"; // Ensure correct lodash import

import useLockScroll from "@/lib/hooks"; // Custom hook for locking scroll when modal is active
import { PlayerProps, SVGIconName } from "@/lib/types"; // Types for props and SVG icon names
const ReactPlayer = lazy(() => import("react-player")); // Lazy load the ReactPlayer component
import FocusTrap from "focus-trap-react"; // Focus trap for handling keyboard focus inside the modal

import Icon from "@/components/Icon/Icon"; // Reusable Icon component
import Button from "@/components/Button/Button"; // Reusable Button component

import { Duration } from "./Duration"; // Custom component to display audio duration

// React does not recognize the `fetchPriority` prop on a DOM element.
// If you want it in the DOM, spell it as lowercase `fetchpriority`.
import img from "@/public/P1080841.jpg"; // Fallback image if no image source is provided

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

  // State to track the current media item's playback state
  const [thisMediaState, setThisMediaState] = useState({
    id: id || 0,
    playedSeconds: playedSeconds,
    duration: duration,
    isFavorite: isFavorite,
  });

  // Sync media state when mediaItem prop changes
  useEffect(() => {
    if (mediaItem) {
      setThisMediaState({
        id: mediaItem.id || 0,
        playedSeconds: mediaItem.playedSeconds,
        duration: mediaItem.duration,
        isFavorite: mediaItem.isFavorite,
      });
    }
  }, [mediaItem]);

  // Refs to handle the player and audio state
  const playerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<any>(null); // audioRef to interact with ReactPlayer

  // State to control animations and modal behavior
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const [pip, setPip] = useState(false); // Picture-in-picture mode
  const [playing, setPlaying] = useState(true); // Control play/pause state
  const [controls, setControls] = useState(false); // Whether player controls are visible
  const [light, setLight] = useState(false); // Light mode for ReactPlayer
  const [volume, setVolume] = useState(0.8); // Volume state
  const [muted, setMuted] = useState(false); // Muted state
  const [played, setPlayed] = useState(0); // Played percentage (0-1)

  const [playbackRate, setPlaybackRate] = useState(1.0); // Playback rate state
  const [loop, setLoop] = useState(false); // Whether playback loops
  const [seeking, setSeeking] = useState(false); // Whether user is seeking

  const [isSSR, setIsSSR] = useState(true); // Server-side rendering state

  // Disable SSR (required for ReactPlayer to function correctly)
  useEffect(() => {
    setIsSSR(false);
  }, []);

  const [isOpen, setIsOpen] = useState(false); // Whether the modal is open

  // Lock the scroll when the modal is open
  useLockScroll(isOpen);

  // Open modal when title and source are available
  useEffect(() => {
    if (title && src) {
      handleOpen();
    }
  }, [title, src]);

  // Handle modal close with animation
  const handleClose = useCallback(() => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimatingOut(false);
      typeof closeModal === "function" && closeModal?.();
    }, 500); // Animation duration for closing
  }, [closeModal]); // Add closeModal as a dependency if needed

  // Close modal on Escape key press
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        handleStop(); // Stop playback if modal closes
      }

      // Reset all states to their default values
      setPip(false);
      setPlaying(true);
      setControls(false);
      setLight(false);
      setVolume(0.8);
      setMuted(false);
      setPlayed(0);
      setPlaybackRate(1.0);
      setLoop(false);
      setSeeking(false);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose(); // Close modal when Escape is pressed
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      playerRef.current?.focus(); // Set focus on the player for accessibility
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown); // Cleanup event listener
    };
  }, [isOpen, handleClose]); // Dependencies ensure proper execution

  // Handle modal open with a delay for smooth rendering
  const [isDelayingOpen, setIsDelayingOpen] = useState(false);
  const handleOpen = () => {
    setIsDelayingOpen(true);
    setTimeout(() => {
      setIsOpen(true);
      setIsDelayingOpen(false); // End the opening delay
    }, 10); // Small delay to allow UI to render smoothly
  };

  // Toggle favorite state of the media item
  const toggleFavorite = useCallback(() => {
    setThisMediaState((prevState) => ({
      ...prevState,
      isFavorite: !prevState.isFavorite,
    }));
  }, []);

  // Seek forward or backward by a specified number of seconds
  const handleSeekTo = (action: "backward" | "forward", seconds: number) => {
    setSeeking(true);
    const sec = (seconds * 1) / thisMediaState?.duration;
    let seekTo = 0;

    if (action === "backward") {
      seekTo = Math.max(played - sec, 0);
    }

    if (action === "forward") {
      seekTo = played + sec;
    }

    setPlayed(seekTo);
    audioRef?.current?.seekTo(seekTo);
    setSeeking(false);
  };

  // Handle playback stop
  const handleStop = () => {
    setPlaying(false);
  };

  // Handle playback toggle between play/pause
  const handlePlay = () => {
    setPlaying(true);
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  // Handle change in seek progress
  const handleSeekChange = (value: number) => {
    if (value) {
      setPlayed(value);
    }
  };

  // Handle when the user stops seeking
  const handleSeekMouseUp = (newValue: number) => {
    setSeeking(false);
    if (audioRef.current) {
      audioRef.current.seekTo(parseFloat(newValue.toString())); // Ensure valid number
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

  // Handle playback progress updates
  const handleProgress = (updatedState: {
    loaded: number | boolean;
    loadedSeconds: number;
    played: number;
    playedSeconds: number;
  }) => {
    const { played, playedSeconds } = updatedState;
    setPlayed(played);

    if (!seeking) {
      setThisMediaState((prevState) => {
        const newState = {
          ...prevState,
          playedSeconds: playedSeconds,
        };
        debouncedUpdate(newState);
        return newState;
      });
    }
  };

  // Handle when the media's total duration is available
  const handleDuration = (duration: number) => {
    setThisMediaState((prevState) => ({
      ...prevState,
      duration,
    }));
    audioRef.current?.seekTo(playedSeconds, "seconds");
  };

  return (
    <FocusTrap active={isOpen}>
      {(isOpen ||
        isAnimatingOut ||
        isDelayingOpen ||
        thisMediaState?.id !== 0) && (
        <div
          className={[
            "flex flex-col items-center justify-center",
            "z-50 bg-black/50 backdrop-blur-lg backdrop-filter",
            "fixed left-0 top-0 h-full w-full",
            "transition-all duration-500 ease-in-out",
            isOpen && !isAnimatingOut
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0",
          ].join(" ")}
          ref={playerRef}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <div className="absolute left-0 top-0 z-50 w-full bg-black/50">
            <Button
              className="absolute right-0 top-0 w-12 p-3 text-white"
              onClick={handleClose}
              ariaLabel="Close"
            >
              <Icon name={SVGIconName.Close} />
            </Button>
          </div>

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
          {thisMediaState?.duration !== 0 && (
            <span className="my-3 block text-center text-sm text-gray-200">
              {title ? he.decode(title) : ""}
            </span>
          )}

          {/* Media Player */}
          {isSSR ? null : (
            <ReactPlayer
              ref={audioRef}
              style={{ display: "none" }}
              url={src}
              pip={pip}
              playing={playing}
              controls={controls}
              light={light}
              loop={loop}
              playbackRate={playbackRate}
              volume={volume}
              muted={muted}
              onPlay={handlePlay}
              onProgress={handleProgress}
              onDuration={handleDuration}
            />
          )}

          {/* Slider for seeking */}
          {thisMediaState?.duration !== 0 && (
            <div className="w-full space-y-2">
              <div className="w-full">
                <ReactSlider
                  value={played * 100}
                  step={0.000001}
                  onChange={(e) => handleSeekChange(e / 100)}
                  onAfterChange={(e) => handleSeekMouseUp(e / 100)}
                  className="mx-10 h-1 cursor-pointer rounded-full bg-gray-300"
                  thumbClassName="absolute -top-1 w-3 h-3 bg-purple-600 rounded-full shadow-lg cursor-grab"
                  trackClassName="h-1 bg-purple-600 rounded-full bg-track-custom"
                />
              </div>

              <div className="mx-10 flex justify-between text-xs text-gray-400">
                <Duration seconds={thisMediaState?.duration * played} />
                <Duration seconds={thisMediaState?.duration * (1 - played)} />
              </div>
            </div>
          )}

          {/* Play/Pause and Seek buttons */}
          {thisMediaState?.duration !== 0 && (
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
                  ariaLabel={playing ? "Pause" : "Play"}
                >
                  <Icon
                    name={playing ? SVGIconName.Pause : SVGIconName.Play}
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
          {thisMediaState?.duration !== 0 && (
            <div className="mt-2 flex items-center justify-center">
              <button
                onClick={() => toggleFavorite()}
                className="flex size-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
              >
                <Icon
                  name={SVGIconName.Favorite}
                  size={"sm"}
                  variation={thisMediaState.isFavorite ? "active" : "default"}
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
          )}

          {/* Spinner icon when loading */}
          {thisMediaState?.duration === 0 && (
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

import {
  FC,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  lazy,
} from "react"; // Import necessary React hooks and types
import Image from "next/image"; // Next.js optimized image component
import he from "he"; // Library for decoding HTML entities
import ReactSlider from "react-slider"; // Slider component for seeking in audio
import debounce from "lodash/debounce"; // Import debounce for throttling updates

import useLockScroll from "@/lib/hooks"; // Custom hook for managing scroll lock
import { PlayerProps, SVGIconName } from "@/lib/types"; // Type definitions
const ReactPlayer = lazy(() => import("react-player")); // Lazy loading ReactPlayer for audio playback
import FocusTrap from "focus-trap-react"; // Focus trap for modal accessibility

import Icon from "@/components/Icon/Icon"; // Icon component for UI elements
import Button from "@/components/Button/Button"; // Button component

import { Duration } from "./Duration"; // Duration component for displaying time

import img from "@/public/P1080841.jpg"; // Default image

/**
 * MainPlayer Component:
 * - Handles the playback, UI controls, and state management for audio media.
 * - Accessible modal for managing media items.
 * @param {PlayerProps} mediaItem - The media item to be played.
 * @param {function} closeModal - Function to close the modal.
 * @param {function} stateCallback - Callback to pass state changes up.
 */
const MainPlayer: FC<PlayerProps> = ({
  mediaItem,
  closeModal,
  stateCallback,
}) => {
  // Destructure the media item properties
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

  // Local state for managing the media's playback and favorite status
  const [thisMediaState, setThisMediaState] = useState({
    id: id || 0,
    playedSeconds: playedSeconds,
    duration: duration,
    isFavorite: isFavorite,
  });

  // Effect: Updates the local state when mediaItem changes
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

  // Refs for the player and audio elements
  const playerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<any>(null);

  // Local state for controlling animation and UI states
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [pip, setPip] = useState(false); // Picture-in-picture support
  const [playing, setPlaying] = useState(true); // Play/pause state
  const [controls, setControls] = useState(false); // Show/hide controls
  const [light, setLight] = useState(false); // Light mode for player
  const [volume, setVolume] = useState(0.8); // Volume level
  const [muted, setMuted] = useState(false); // Mute/unmute
  const [played, setPlayed] = useState(0); // Track how much is played

  const [playbackRate, setPlaybackRate] = useState(1.0); // Playback speed
  const [loop, setLoop] = useState(false); // Loop mode
  const [seeking, setSeeking] = useState(false); // Seeking status

  const [isSSR, setIsSSR] = useState(true); // Handle server-side rendering

  // Disable SSR after the initial render
  useEffect(() => {
    setIsSSR(false);
  }, []);

  const [isOpen, setIsOpen] = useState(false); // Modal open state

  // Use custom hook to lock scroll when modal is open
  useLockScroll(isOpen);

  // Effect: Handles opening the modal when title and src are available
  useEffect(() => {
    if (title && src) {
      handleOpen();
    }
  }, [title, src]);

  // Function: Handles closing the modal with a delay for animation
  const handleClose = useCallback(() => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimatingOut(false);
      if (typeof closeModal === "function") {
        closeModal(); // Call closeModal function if it exists
      }
    }, 500); // Animation duration
  }, [closeModal]);

  // Effect: Handle keydown (Escape) and clean up on modal open/close
  useEffect(() => {
    if (!isOpen && audioRef.current) {
      handleStop(); // Stop playback if modal is closed
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose(); // Close modal on Escape key press
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown); // Add keydown event listener
      playerRef.current?.focus(); // Focus the player modal
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown); // Clean up event listener
    };
  }, [isOpen, handleClose]);

  const [isDelayingOpen, setIsDelayingOpen] = useState(false);

  // Function: Handles opening the modal with a short delay
  const handleOpen = () => {
    setIsDelayingOpen(true);
    setTimeout(() => {
      setIsOpen(true);
      setIsDelayingOpen(false); // Delay to allow for smooth rendering
    }, 10);
  };

  // Function: Toggle favorite status
  const toggleFavorite = useCallback(() => {
    setThisMediaState((prevState) => {
      const newState = { ...prevState, isFavorite: !prevState.isFavorite };
      return newState;
    });
  }, []);

  // Function: Handle seeking within the media
  const handleSeekTo = (action: "backward" | "forward", seconds: number) => {
    setSeeking(true);
    const sec = (seconds * 1) / thisMediaState?.duration;

    let seekTo = 0;
    if (action === "backward") {
      seekTo = Math.max(played - sec, 0); // Seek backward
    }
    if (action === "forward") {
      seekTo = played + sec; // Seek forward
    }

    setPlayed(seekTo);
    audioRef?.current?.seekTo(seekTo);

    setSeeking(false);
  };

  // Function: Stop the media playback
  const handleStop = () => {
    setPlaying(false);
  };

  // Function: Toggle between play and pause
  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  // Function: Handle seek slider change
  const handleSeekChange = (value: number) => {
    if (value) {
      setPlayed(value); // Update played time based on slider value
    }
  };

  // Function: Handle seek slider mouse up event
  const handleSeekMouseUp = (newValue: number) => {
    setSeeking(false);
    if (audioRef.current) {
      audioRef.current.seekTo(parseFloat(newValue.toString())); // Ensure value is a float
    }
  };

  // Memoize debounced update to avoid unnecessary state updates
  const debouncedUpdate = useMemo(
    () =>
      debounce((newState) => {
        stateCallback?.(newState); // Call stateCallback if provided
      }, 300), // 300ms debounce delay
    [stateCallback],
  );

  // Function: Handle media progress updates
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
        debouncedUpdate(newState); // Update state with debounce
        return newState;
      });
    }
  };

  // Function: Handle media duration update
  const handleDuration = (duration: number) => {
    setThisMediaState((prevState) => {
      const newState = { ...prevState, duration };
      return newState;
    });
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
                  : img // Use default image if no imageSrc is provided
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

          {/* Audio Player */}
          {!isSSR && (
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

          {/* Seek slider */}
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

          {/* Playback Controls */}
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

          {/* Favorite and Link Controls */}
          {thisMediaState?.duration !== 0 && (
            <div className="mt-2 flex items-center justify-center">
              <button
                onClick={() => toggleFavorite()}
                className="flex size-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                aria-label="Toggle favorite"
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

          {/* Spinner during loading */}
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

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

import useLockScroll from "@/lib/hooks";
import { PlayerProps, SVGIconName } from "@/lib/types";
const ReactPlayer = lazy(() => import("react-player"));

import Icon from "@/components/Icon/Icon";
import Button from "@/components/Button/Button";

import { Duration } from "./Duration";

// React does not recognize the `fetchPriority` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `fetchpriority` instead. If you accidentally passed it from a parent component, remove it from the DOM element.
import img from "@/public/P1080841.jpg";

const MainPlayer: FC<PlayerProps> = ({
  mediaItem,
  closeModal,
  stateCallback,
}) => {
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

  const [thisMediaState, setThisMediaState] = useState({
    id: id || 0,
    playedSeconds: playedSeconds,
    duration: duration,
    isFavorite: isFavorite,
  });

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

  const audioRef = useRef<ReactPlayer>(null);

  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // const [url, setUrl] = useState(null);
  const [pip, setPip] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [controls, setControls] = useState(false);
  const [light, setLight] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);

  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [loop, setLoop] = useState(false);
  const [seeking, setSeeking] = useState(false);

  const [isSSR, setIsSSR] = useState(true);

  useEffect(() => {
    setIsSSR(false);
  }, []);

  const [isOpen, setIsOpen] = useState(false);

  // const [favorite, setFavorite] = useState(isFavorite);

  useLockScroll(isOpen);

  useEffect(() => {
    if (title && src) {
      handleOpen();
    }
  }, [title, src]);

  // useEffect for handling other state updates when the modal closes
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        handleStop();
      }

      // Reset other states
      // setUrl(null);
      setPip(false);
      setPlaying(true);
      setControls(false);
      setLight(false);
      setVolume(0.8);
      setMuted(false);
      setPlayed(0);
      // setLoaded(0);
      setPlaybackRate(1.0);
      setLoop(false);
      setSeeking(false);
    }
  }, [isOpen]); // Dependency array ensures this runs only when isOpen changes

  const [isDelayingOpen, setIsDelayingOpen] = useState(false);

  const handleOpen = () => {
    setIsDelayingOpen(true); // Start delaying
    setTimeout(() => {
      setIsOpen(true);
      setIsDelayingOpen(false); // End delaying
    }, 10); // Short delay, just enough for the browser to render the initial state
  };

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimatingOut(false);
      typeof closeModal === "function" && closeModal();
    }, 500); // Duration of the closing animation
  };

  const toggleFavorite = useCallback(() => {
    setThisMediaState((prevState) => {
      const newState = { ...prevState, isFavorite: !prevState.isFavorite };
      // stateCallback?.(newState);
      return newState;
    });
  }, []);

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

  const handleStop = () => {
    setPlaying(false);
  };

  const handlePlay = () => {
    setPlaying(true);
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleSeekChange = (value: number) => {
    if (value) {
      setPlayed(value);
    }
  };

  const handleSeekMouseUp = (newValue: number) => {
    setSeeking(false);
    if (audioRef.current) {
      audioRef.current.seekTo(parseFloat(newValue.toString())); // Ensure newValue is parsed correctly
    }
  };

  const debouncedUpdate = useMemo(
    () =>
      debounce((newState) => {
        stateCallback?.(newState);
      }, 300),
    [stateCallback],
  );

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

  const handleDuration = (duration: number) => {
    setThisMediaState((prevState) => {
      const newState = { ...prevState, duration };
      // stateCallback?.({ ...newState });
      return newState;
    });
    audioRef.current?.seekTo(playedSeconds, "seconds");
  };

  return (
    <>
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
        >
          <div className="absolute left-0 top-0 z-50 w-full bg-black/50">
            <Button
              className="absolute right-0 top-0 w-12 p-3 text-white"
              onClick={handleClose}
              ariaLabel="Close"
            >
              <Icon name={SVGIconName.Close} />
            </Button>
          </div>
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
          {thisMediaState?.duration !== 0 && (
            <span className="my-3 block text-center text-sm text-gray-200">
              {title ? he.decode(title) : ""}
            </span>
          )}

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
    </>
  );
};

export default MainPlayer;

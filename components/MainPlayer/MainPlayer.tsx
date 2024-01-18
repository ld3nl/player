import { FC, useEffect, useState, useRef, useContext } from "react";
import Image from "next/image";
import he from "he";
import ReactSlider from "react-slider";
import { GlobalContext } from "../../pages/_app";
import useLockScroll from "../../lib/hooks";
import Icon from "../Icon/Icon";

import ReactPlayer from "react-player";

import { Duration } from "./Duration";

import img from "@/public/P1080841.jpg";

interface Props {
  imageSrc?: string;
  title?: string;
  src?: string;
  id?: string;
  link?: string;
}

// const imgArray = [
//   "https://www.paullowe.org/wp-content/uploads/2017/06/P1080841.jpg",
//   "https://www.paullowe.org/wp-content/uploads/2016/03/waterfall_1.jpg",
//   "https://www.paullowe.org/wp-content/uploads/2016/09/IMG_0987_low_website.jpg",
// ];

const MainPlayer: FC<Props> = ({ title, src, id, link, imageSrc }) => {
  console.log("imageSrc", imageSrc);
  const audioRef = useRef<any>(null);

  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // const [url, setUrl] = useState(null);
  const [pip, setPip] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [controls, setControls] = useState(false);
  const [light, setLight] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);

  // const [loaded, setLoaded] = useState<number | boolean>(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [loop, setLoop] = useState(false);
  const [seeking, setSeeking] = useState(false);

  const [isSSR, setIsSSR] = useState(true);

  useEffect(() => {
    setIsSSR(false);
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  // const [audioIsLoading, setAudioIsLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);

  const { setGlobalContext } = useContext(GlobalContext);

  useLockScroll(isOpen);

  useEffect(() => {
    // const storedProgress = localStorage.getItem(`${id}-progress`);
    const favoriteItems = JSON.parse(
      localStorage.getItem("favoriteItems") || "[]",
    );

    setFavorite(favoriteItems.includes(id));

    handlePlay();
  }, [src, id]);

  //
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

      setGlobalContext((prev) => ({
        ...prev,
        isModalActive: false,
        selectedItem: { title: "", date: "", src: "", id: "" },
      }));

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
      setDuration(0);
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
      setGlobalContext((prev) => ({ ...prev, isModalActive: true }));
    }, 10); // Short delay, just enough for the browser to render the initial state
  };

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimatingOut(false);
    }, 500); // Duration of the closing animation
  };

  const toggleFavorite = (id: any) => {
    const favoriteItems = JSON.parse(
      localStorage.getItem("favoriteItems") || "[]",
    );

    const isFavorite = favoriteItems.includes(id);

    if (isFavorite) {
      const updatedItems = favoriteItems.filter((item: any) => item !== id);
      localStorage.setItem("favoriteItems", JSON.stringify(updatedItems));
    } else {
      favoriteItems.push(id);
      localStorage.setItem("favoriteItems", JSON.stringify(favoriteItems));
    }

    setFavorite(!isFavorite);
  };

  const handleSeekTo = (action: "backward" | "forward", seconds: number) => {
    setSeeking(true);

    const sec = (seconds * 1) / duration;

    let seekTo = 0;

    if (action === "backward") {
      seekTo = Math.max(played - sec, 0);
    }

    if (action === "forward") {
      seekTo = played + sec;
    }

    setPlayed(seekTo);
    audioRef.current.seekTo(seekTo);

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

  const handleSeekChange = (e: any) => {
    const newValue = e.target?.value || e;
    if (newValue) {
      setPlayed(parseFloat(newValue));
    }
  };

  const handleSeekMouseUp = (e: any) => {
    const newValue = e.target?.value || e;
    setSeeking(false);
    if (newValue) {
      audioRef.current?.seekTo(parseFloat(newValue));
    }
  };

  const handleProgress = (updatedState: {
    loaded: number | boolean;
    loadedSeconds: number;
    played: number;
    playedSeconds: number;
  }) => {
    // We only want to update time slider if we are not currently seeking
    if (!seeking) {
      const { played, playedSeconds } = updatedState;

      setPlayed(played);

      localStorage.setItem(
        `${id}-progress`,
        JSON.stringify({ playedSeconds, duration, favorite }),
      );
    }
  };

  const handleDuration = (duration: any) => {
    setDuration(duration);

    const storedProgress = localStorage.getItem(`${id}-progress`);

    if (storedProgress) {
      const { playedSeconds } = JSON.parse(storedProgress);
      audioRef.current.seekTo(playedSeconds, "seconds");
    }
  };

  return (
    <>
      {(isOpen || isAnimatingOut || isDelayingOpen) && (
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
            <button
              className="absolute right-0 top-0 w-12 p-3 text-white"
              onClick={handleClose}
            >
              <Icon name={"Close"} />
            </button>
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
          {duration !== 0 && (
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

          {duration !== 0 && (
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
                <Duration seconds={duration * played} />
                <Duration seconds={duration * (1 - played)} />
              </div>
            </div>
          )}

          {duration !== 0 && (
            <div className="flex items-center justify-center p-4">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => handleSeekTo("backward", 15)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-700"
                >
                  <Icon name={"BackwardRewind"} size="twoThirds" />
                </button>

                <button
                  onClick={handlePlayPause}
                  className="mx-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-700"
                >
                  <Icon name={playing ? "Pause" : "Play"} size={"md"} />
                </button>

                <button
                  onClick={() => handleSeekTo("forward", 15)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-700"
                >
                  <Icon name={"ForwardRewind"} size="twoThirds" />
                </button>
              </div>
            </div>
          )}

          {duration !== 0 && (
            <div className="mt-2 flex items-center justify-center">
              <button
                onClick={() => toggleFavorite(id)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
              >
                <Icon
                  name={"Favorite"}
                  size={"sm"}
                  variation={favorite ? "active" : "default"}
                  customVariation={{
                    active: "fill-purple-600",
                    default: "fill-white stroke-purple-600 stroke-2",
                  }}
                />
              </button>

              <a
                href={link}
                target="_blank"
                className="ms-8 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
              >
                <Icon
                  name={"Link"}
                  size="twoThirds"
                  customVariation={{
                    active: "fill-purple-600",
                    default: "fill-purple-600",
                  }}
                />
              </a>
            </div>
          )}

          {duration === 0 && (
            <div className="flex p-10">
              <Icon
                name={"Spinner"}
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

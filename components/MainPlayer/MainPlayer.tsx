import { FC, useEffect, useState, useRef, useContext } from "react";
import Image from "next/image";
import he from "he";
import ReactSlider from "react-slider";
import { GlobalContext } from "../../pages/_app";
import useLockScroll from "../../lib/hooks";
import Icon from "../Icon/Icon";

import ReactPlayer from "react-player";

import { Duration } from "./Duration";

import css from "./MainPlayer.module.scss";
import img from "@/public/P1080841.jpg";

interface Props {
  title?: string;
  src?: string;
  id?: string;
}

// const imgArray = [
//   "https://www.paullowe.org/wp-content/uploads/2017/06/P1080841.jpg",
//   "https://www.paullowe.org/wp-content/uploads/2016/03/waterfall_1.jpg",
//   "https://www.paullowe.org/wp-content/uploads/2016/09/IMG_0987_low_website.jpg",
// ];

const MainPlayer: FC<Props> = ({ title, src, id }) => {
  const audioRef = useRef<any>(null);

  const [url, setUrl] = useState(null);
  const [pip, setPip] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [controls, setControls] = useState(false);
  const [light, setLight] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);

  const [loaded, setLoaded] = useState<number | boolean>(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [loop, setLoop] = useState(false);
  const [seeking, setSeeking] = useState(false);

  const [isSSR, setIsSSR] = useState(true);

  useEffect(() => {
    setIsSSR(false);
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [audioIsLoading, setAudioIsLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);

  const { setGlobalContext } = useContext(GlobalContext);

  useLockScroll(isOpen);

  useEffect(() => {
    const storedProgress = localStorage.getItem(`${id}-progress`);
    const favoriteItems = JSON.parse(
      localStorage.getItem("favoriteItems") || "[]"
    );

    setFavorite(favoriteItems.includes(id));

    handlePlay();
  }, [src, id]);

  useEffect(() => {
    if (title && src) {
      handleOpen();
    }
  }, [title, src]);

  const handleOpen = () => {
    setIsOpen(true);
    setGlobalContext((prev) => ({ ...prev, isModalActive: true }));
  };

  const handleClose = () => {
    setIsOpen(false);

    if (audioRef.current) {
      handleStop();
    }

    setGlobalContext((prev) => ({
      ...prev,
      isModalActive: false,
      selectedItem: { title: "", date: "", src: "", id: "" },
    }));

    setUrl(null);
    setPip(false);
    setPlaying(true);
    setControls(false);
    setLight(false);
    setVolume(0.8);
    setMuted(false);
    setPlayed(0);
    setLoaded(0);
    setDuration(0);
    setPlaybackRate(1.0);
    setLoop(false);
    setSeeking(false);
  };

  const toggleFavorite = (id: any) => {
    const favoriteItems = JSON.parse(
      localStorage.getItem("favoriteItems") || "[]"
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
      // seekTo = Math.min(played + sec, 1);
      seekTo = played + sec;
    }

    setPlayed(seekTo);
    audioRef.current.seekTo(seekTo);

    setSeeking(false);
  };

  const handleStop = () => {
    setUrl(null);
    setPlaying(false);
  };

  const handlePlay = () => {
    console.log("onPlay");

    setPlaying(true);
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleSeekMouseDown = (e: any) => {
    setSeeking(true);
  };

  const handleSeekChange = (e: any) => {
    const newValue = e.target?.value || e;
    console.log(newValue);
    if (newValue) {
      setPlayed(parseFloat(newValue));
    }
  };

  const handleSeekTouchStart = (e: any) => {
    setSeeking(true);
  };

  const handleSeekTouchEnd = (e: any) => {
    setSeeking(false);
    audioRef.current?.seekTo(parseFloat(e.target.value));
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
      const { loaded, played, playedSeconds } = updatedState;

      setLoaded(loaded);
      setPlayed(played);

      localStorage.setItem(
        `${id}-progress`,
        JSON.stringify({ playedSeconds, duration, favorite })
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
      <div className={[css.MainPlayer, isOpen ? css.open : ""].join(" ")}>
        <div className={css.top}>
          <button className={css["close-button"]} onClick={handleClose}>
            <Icon className={css.specialIcon} name={"Close"} />
          </button>
        </div>
        <div className={css.artWork}>
          <Image className={css.image} src={img} alt={"sone"} />
        </div>
        <span className={css.title}>{title ? he.decode(title) : ""}</span>

        {isSSR ? null : (
          <ReactPlayer
            ref={audioRef}
            style={{ display: "none" }}
            url={src}
            onReady={() => setAudioIsLoading(true)}
            pip={pip}
            playing={playing}
            controls={controls}
            light={light}
            loop={loop}
            playbackRate={playbackRate}
            volume={volume}
            muted={muted}
            // onReady={() => console.log('onReady')}
            // onStart={() => console.log("onStart")}
            onPlay={handlePlay}
            // onEnablePIP={this.handleEnablePIP}
            // onDisablePIP={this.handleDisablePIP}
            // onPause={this.handlePause}
            // onBuffer={() => console.log('onBuffer')}
            // onPlaybackRateChange={this.handleOnPlaybackRateChange}
            // onSeek={e => console.log('onSeek', e)}
            // onEnded={this.handleEnded}
            // onError={e => console.log('onError', e)}
            onProgress={handleProgress}
            onDuration={handleDuration}
          />
        )}

        {duration !== 0 && (
          <div className={css.Progress}>
            {/* <input
              type="range"
              min={0}
              max={0.999999}
              step="any"
              value={played}
              onMouseDown={handleSeekMouseDown}
              // onTouchStart={handleSeekTouchStart}
              onChange={handleSeekChange}
              onMouseUp={handleSeekMouseUp}
              // onTouchEnd={handleSeekTouchEnd}
            /> */}
            <div className={css.progressBar}>
              <ReactSlider
                value={played * 100}
                step={0.000001}
                className={css["horizontal-slider"]}
                thumbClassName={css["example-thumb"]}
                trackClassName={css["example-track"]}
                // onMouseDown={handleSeekMouseDown}
                onChange={(e) => handleSeekChange(e / 100)}
                onAfterChange={(e) => handleSeekMouseUp(e / 100)}
              />
            </div>

            <div className={css.Duration}>
              <Duration seconds={duration * played} />
              <Duration seconds={duration * (1 - played)} />
            </div>
          </div>
        )}

        {duration !== 0 && (
          <div className={css.audio}>
            <div className={css.actionButtons}>
              <button
                className={css.sm}
                onClick={() => handleSeekTo("backward", 15)}
              >
                <Icon name={"BackwardRewind"} size={"sm"} />
              </button>

              <button onClick={handlePlayPause}>
                <Icon name={playing ? "Pause" : "Play"} />
              </button>
              <button
                className={css.sm}
                onClick={() => handleSeekTo("forward", 15)}
              >
                <Icon name={"ForwardRewind"} size={"sm"} />
              </button>
            </div>
          </div>
        )}

        <div className={css.foot}>
          <button
            className={[css.sm, css.button].join(" ")}
            onClick={() => toggleFavorite(id)}
          >
            <Icon
              name={"Favorite"}
              size={"sm"}
              variation={favorite ? "active" : "default"}
            />
          </button>
        </div>

        {duration === 0 && (
          <div className={css["loader"]}>
            <div className={css["dot"]}></div>
            <div className={css["dot"]}></div>
            <div className={css["dot"]}></div>
          </div>
        )}
      </div>
    </>
  );
};

export default MainPlayer;

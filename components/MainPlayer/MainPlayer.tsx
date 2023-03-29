import { FC, useEffect, useState, useRef, useContext } from "react";
import he from "he";
import { GlobalContext } from "../../pages/_app";
import css from "./MainPlayer.module.scss";
import useLockScroll from "../../lib/hooks";
import Icon from "../Icon/Icon";

interface Props {
  title?: string;
  src?: string;
  id?: string;
}

type Progress = {
  currentTime: number;
  duration: number;
};

const imgArray = [
  "https://www.paullowe.org/wp-content/uploads/2017/06/P1080841.jpg",
  "https://www.paullowe.org/wp-content/uploads/2016/03/waterfall_1.jpg",
  "https://www.paullowe.org/wp-content/uploads/2016/09/IMG_0987_low_website.jpg",
];

const MainPlayer: FC<Props> = ({ title, src, id }) => {
  const [progress, setProgress] = useState<Progress>({
    currentTime: 0,
    duration: 0,
  });
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setSrc] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);

  const { globalContext, setGlobalContext } = useContext(GlobalContext);

  useLockScroll(isOpen);

  useEffect(() => {
    const imgSrc = imgArray[Math.floor(Math.random() * imgArray.length)];
    setSrc(imgSrc);
  }, []);

  useEffect(() => {
    const storedProgress = localStorage.getItem(`${id}-progress`);
    if (storedProgress) {
      const { currentTime } = JSON.parse(storedProgress);
      setProgress(JSON.parse(storedProgress));
      if (audioRef.current) {
        audioRef.current.currentTime = currentTime;
      }
    }
  }, [src, id]);

  const handleOpen = () => {
    setIsOpen(true);
    setGlobalContext((prev) => ({ ...prev, isModalActive: true }));
  };

  const handleClose = () => {
    setIsOpen(false);

    if (audioRef.current) {
      audioRef.current.pause();
    }

    setGlobalContext((prev) => ({
      ...prev,
      isModalActive: false,
      selectedItem: { title: "", date: "", src: "", id: "" },
    }));
  };

  useEffect(() => {
    if (title && src) {
      handleOpen();
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [title, src]);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const currentTime = e.currentTarget.currentTime;
    const duration = e.currentTarget.duration;
    setProgress({ currentTime, duration });
    localStorage.setItem(
      `${id}-progress`,
      JSON.stringify({ currentTime, duration })
    );
  };

  const handleSkipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 15;
    }
  };

  const handleSkipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 15;
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const currentTime = Number(e.currentTarget.value);
    setProgress({ ...progress, currentTime });
    if (audioRef.current) {
      audioRef.current.currentTime = currentTime;
    }
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const duration = e.currentTarget.duration;
    setProgress({ ...progress, duration });
  };

  const remainingTime = progress.duration - progress.currentTime;
  const remainingMinutes = Math.floor(remainingTime / 60);
  const remainingSeconds = Math.floor(remainingTime % 60);

  return (
    <>
      <div className={[css.MainPlayer, isOpen ? css.open : ""].join(" ")}>
        <button className={css["close-button"]} onClick={handleClose}>
          Close
        </button>
        <div className={css.artWork}>
          <img className={css.image} src={imageSrc} alt={"sone"} />
        </div>
        <h2>{title ? he.decode(title) : ""}</h2>
        <div className={css.progressBar}>
          <progress
            value={progress.currentTime}
            max={isNaN(progress.duration) ? 0 : progress.duration}
          >
            11
          </progress>
          <input
            step=".01"
            className={css.customRange}
            type="range"
            min={0}
            max={isNaN(progress.duration) ? 0 : progress.duration}
            value={progress.currentTime}
            onInput={handleInput}
          />
          <span className={css["duration"]}>
            {remainingMinutes}m {remainingSeconds.toString().padStart(2, "0")}s
            left
          </span>
        </div>
        <div className={css.audio}>
          <audio
            className={css["audio-element"]}
            src={src}
            onTimeUpdate={handleTimeUpdate}
            ref={audioRef}
            onLoadedMetadata={handleLoadedMetadata}
            // controls
          />

          <div className={css.actionButtons}>
            <button className={css.sm} onClick={handleSkipBackward}>
              <Icon name={"BackwardRewind"} size={"sm"} />
            </button>

            <button onClick={handlePlayPause}>
              <Icon name={isPlaying ? "Pause" : "Play"} />
            </button>
            <button className={css.sm} onClick={handleSkipForward}>
              <Icon name={"ForwardRewind"} size={"sm"} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPlayer;

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [progress, setProgress] = useState<Progress>({
    currentTime: 0,
    duration: 0,
  });

  const [trackProgress, setTrackProgress] = useState(0);

  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setSrc] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);

  const [trackStyling, setTrackStyling] = useState("");

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

  useEffect(() => {
    if (title && src) {
      handleOpen();
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [title, src]);

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

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const currentTime = e.currentTarget.currentTime;
    const duration = e.currentTarget.duration;

    localStorage.setItem(
      `${id}-progress`,
      JSON.stringify({ currentTime, duration })
    );

    const currentPercentage = duration
      ? `${(currentTime / progress.duration) * 100}%`
      : "0%";

    const trackStylingVar = `
    -webkit-gradient(linear, 0% 0%, 100% 0%, color-stop(${currentPercentage}, rgb(255 113 0)), color-stop(${currentPercentage}, rgb(255 255 255)))
    `;

    setTrackStyling(trackStylingVar);

    setProgress({ currentTime, duration });
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

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const duration = e.currentTarget.duration;
    setProgress((prev) => ({ ...prev, duration }));
  };

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (audioRef.current?.ended) {
        // toNextTrack();
      } else if (audioRef.current) {
        setTrackProgress(audioRef.current.currentTime);
      }
    }, 1000);
  };

  const onScrub = (value: number) => {
    if (audioRef.current && intervalRef.current) {
      clearInterval(intervalRef.current);
      audioRef.current.currentTime = value;
      setTrackProgress(audioRef.current.currentTime);
    }
  };

  const onScrubEnd = () => {
    if (audioRef.current) {
      if (!isPlaying) {
        setIsPlaying(true);
      }

      startTimer();
    }
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
          <input
            type="range"
            value={progress.currentTime}
            step="1"
            min="0"
            max={isNaN(progress.duration) ? 0 : progress.duration}
            className={css["progress"]}
            onChange={(e) => onScrub(Number(e.target.value))}
            onMouseUp={onScrubEnd}
            onKeyUp={onScrubEnd}
            style={{ background: trackStyling }}
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

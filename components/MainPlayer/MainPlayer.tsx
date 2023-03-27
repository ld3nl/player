import { FC, useEffect, useState, useRef, useContext } from "react";
import css from "./MainPlayer.module.scss";
import useLockScroll from "../../lib/hooks";
import { GlobalContext } from "../../pages/_app";

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

    setGlobalContext((prev) => ({ ...prev, isModalActive: false }));
  };

  useEffect(() => {
    if (title && src) {
      handleOpen();
      if (audioRef.current) {
        audioRef.current.play();
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

  return (
    <>
      <div className={[css.MainPlayer, isOpen ? css.open : ""].join(" ")}>
        <button className={css["close-button"]} onClick={handleClose}>
          Close
        </button>
        <div className={css.artWork}>
          <img className={css.image} src={imageSrc} alt={"sone"} />
        </div>
        <h1>{title}</h1>
        <audio
          className={css["audio-element"]}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          ref={audioRef}
          controls
        />
      </div>
    </>
  );
};

export default MainPlayer;

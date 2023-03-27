import React, { useContext, useState, useEffect } from "react";
import css from "./Player.module.scss";
import { GlobalContext } from "../../pages/_app";

type Props = {
  src: string;
  id: string;
  title: string;
  date: string;
  selectAudio?: Function;
};

type Progress = {
  currentTime: number;
  duration: number;
};

const AudioPlayer: React.FC<Props> = ({
  src,
  title,
  date,
  id,
  selectAudio,
}) => {
  const [progress, setProgress] = useState<Progress>({
    currentTime: 0,
    duration: 0,
  });

  const { globalContext } = useContext(GlobalContext);

  useEffect(() => {
    const storedProgress = localStorage.getItem(`${id}-progress`);
    if (storedProgress) {
      const { currentTime } = JSON.parse(storedProgress);
      setProgress(JSON.parse(storedProgress));
    }
  }, [src, id, globalContext]);

  const remainingTime = progress.duration - progress.currentTime;
  const remainingMinutes = Math.floor(remainingTime / 60);
  const remainingSeconds = Math.floor(remainingTime % 60);

  const transferParam = (value: any) =>
    selectAudio !== undefined && selectAudio(value);

  return (
    <div
      className={css["audio-player"]}
      onClick={() => transferParam({ title, date, src, id })}
    >
      <h2>{title}</h2>
      <p>{date}</p>

      {progress.currentTime != 0 && (
        <div className={css["progress-bar"]}>
          <progress
            className={css["progress"]}
            value={progress.currentTime}
            max={progress.duration}
          />
          <span className={css["duration"]}>
            {remainingMinutes}m {remainingSeconds.toString().padStart(2, "0")}s
            left
          </span>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;

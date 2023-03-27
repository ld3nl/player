import React, { useContext, useState, useEffect } from "react";
import he from "he";
import { GlobalContext } from "../../pages/_app";

import css from "./Player.module.scss";

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

  const [publishDate, setPublishDate] = useState(
    new Date().toLocaleDateString("en-AU")
  );

  const { globalContext, setGlobalContext } = useContext(GlobalContext);

  useEffect(() => {
    const storedProgress = localStorage.getItem(`${id}-progress`);
    if (storedProgress) {
      const { currentTime } = JSON.parse(storedProgress);
      setProgress(JSON.parse(storedProgress));
    }
    setPublishDate(new Date(date).toLocaleDateString("en-AU"));
  }, [src, id, globalContext, date]);

  const remainingTime = progress.duration - progress.currentTime;
  const remainingMinutes = Math.floor(remainingTime / 60);
  const remainingSeconds = Math.floor(remainingTime % 60);

  const transferParam = (value: any) =>
    selectAudio !== undefined && selectAudio(value);

  return (
    <div
      className={css["audio-player"]}
      onClick={() => {
        // transferParam({ title, date, src, id });
        setGlobalContext((prev) => ({
          ...prev,
          selectedItem: { title, date, src, id },
        }));
      }}
    >
      <h2>{he.decode(title)}</h2>

      <p>{publishDate}</p>

      {progress.currentTime != 0 && (
        <div className={css["progress-bar"]}>
          <div>
            <progress
              className={css["progress"]}
              value={progress.currentTime}
              max={progress.duration}
            />
          </div>
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

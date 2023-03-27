import React, { useState, useEffect, useRef } from "react";
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
  // const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const storedProgress = localStorage.getItem(`${id}-progress`);
    if (storedProgress) {
      const { currentTime } = JSON.parse(storedProgress);
      setProgress(JSON.parse(storedProgress));
      // if (audioRef.current) {
      //   audioRef.current.currentTime = currentTime;
      // }
    }
  }, [src, id]);

  const remainingTime = progress.duration - progress.currentTime;
  const remainingMinutes = Math.floor(remainingTime / 60);
  const remainingSeconds = Math.floor(remainingTime % 60);

  const transferParam = (value: any) =>
    selectAudio !== undefined && selectAudio(value);

  // const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
  //   const currentTime = e.currentTarget.currentTime;
  //   const duration = e.currentTarget.duration;
  //   setProgress({ currentTime, duration });
  //   localStorage.setItem(
  //     `${id}-progress`,
  //     JSON.stringify({ currentTime, duration })
  //   );
  // };

  return (
    <div
      className={css["audio-player"]}
      onClick={() => transferParam({ title, date, src, id })}
    >
      <h2>{title}</h2>
      <p>{date}</p>
      {/* <audio
        className={css["audio-element"]}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        ref={audioRef}
        controls
      /> */}
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

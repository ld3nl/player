import React, { useState, useEffect, useRef } from "react";
import css from "./Player.module.scss";

type Props = {
  src: string;
  id: string;
  title: string;
  date: string;
};

type Progress = {
  currentTime: number;
  duration: number;
};

const AudioPlayer: React.FC<Props> = ({ src, title, date, id }) => {
  const [progress, setProgress] = useState<Progress>({
    currentTime: 0,
    duration: 0,
  });
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const storedProgress = localStorage.getItem(`${id}-progress`);
    if (storedProgress) {
      const { currentTime } = JSON.parse(storedProgress);
      setProgress(JSON.parse(storedProgress));
      if (audioRef.current) {
        audioRef.current.currentTime = currentTime;
      }
    }
  }, [src]);

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
    <div className={css["audio-player"]}>
      <h2>{title}</h2>
      <p>{date}</p>
      <audio
        className={css["audio-element"]}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        ref={audioRef}
        controls
      />
      <div className={css["progress-bar"]}>
        <span className={css["current-time"]}>
          {Math.floor(progress.currentTime)}
        </span>
        <progress
          className={css["progress"]}
          value={progress.currentTime}
          max={progress.duration}
        />
        <span className={css["duration"]}>{Math.floor(progress.duration)}</span>
      </div>
    </div>
  );
};

export default AudioPlayer;

import React, { useState, useEffect, useRef } from "react";

type Props = {
  src: string;
  title: string;
  date: string;
};

type Progress = {
  currentTime: number;
  duration: number;
};

const AudioPlayer: React.FC<Props> = ({ src, title, date }) => {
  const [progress, setProgress] = useState<Progress>({
    currentTime: 0,
    duration: 0,
  });
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const storedProgress = localStorage.getItem(`${src}-progress`);
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
      `${src}-progress`,
      JSON.stringify({ currentTime, duration })
    );
  };

  return (
    <div>
      <h2>{title}</h2>
      <p>{date}</p>
      <audio
        src={src}
        onTimeUpdate={handleTimeUpdate}
        ref={audioRef}
        controls
      />
      <div>
        <span>{Math.floor(progress.currentTime)}</span>
        <progress value={progress.currentTime} max={progress.duration} />
        <span>{Math.floor(progress.duration)}</span>
      </div>
    </div>
  );
};

export default AudioPlayer;

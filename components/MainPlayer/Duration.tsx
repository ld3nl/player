import React from "react";

interface DurationProps {
  className?: string;
  seconds: number;
}

export const Duration: React.FC<DurationProps> = ({ className, seconds }) => {
  const format = (time: number) => {
    const date = new Date(time * 1000);
    const mm = pad(date.getUTCMinutes());
    const ss = pad(date.getUTCSeconds());
    return `${mm}:${ss}`;
  };

  const pad = (value: number) => {
    return value < 10 ? `0${value}` : `${value}`;
  };

  return (
    <time dateTime={`P${Math.round(seconds)}S`} className={className}>
      {format(seconds)}
    </time>
  );
};

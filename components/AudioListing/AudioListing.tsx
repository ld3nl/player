import React, { useContext, useState, useEffect } from "react";
import he from "he";
import { GlobalContext } from "../../pages/_app";

import Icon from "../Icon/Icon";
import Button from "../Button/Button";
import css from "./AudioListing.module.scss";

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
  const [favorite, setFavorite] = useState(false);

  const [publishDate, setPublishDate] = useState(
    new Date().toLocaleDateString("en-AU")
  );

  const { globalContext, setGlobalContext } = useContext(GlobalContext);

  const [favoriteItems, setFavoriteItems] = useState<number[]>(
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("favoriteItems") || "[]")
      : []
  );

  useEffect(() => {
    const storedProgress = localStorage.getItem(`${id}-progress`);
    const favoriteItems = JSON.parse(
      localStorage.getItem("favoriteItems") || "[]"
    );

    setFavorite(favoriteItems.includes(id));

    if (storedProgress) {
      setProgress(JSON.parse(storedProgress));
    }
    setPublishDate(new Date(date).toLocaleDateString("en-AU"));
  }, [src, id, globalContext, date]);

  const remainingTime = progress.duration - progress.currentTime;
  const remainingMinutes = Math.floor(remainingTime / 60);
  const remainingSeconds = Math.floor(remainingTime % 60);

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

  return (
    <div className={css["audio-listing"]}>
      <div>
        <Button onClick={() => toggleFavorite(id)}>
          <Icon
            name={"Favorite"}
            size={"sm"}
            variation={favorite ? "active" : "default"}
          />
        </Button>
      </div>

      <div
        onClick={() => {
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
              {remainingMinutes}m {remainingSeconds.toString().padStart(2, "0")}
              s left
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;

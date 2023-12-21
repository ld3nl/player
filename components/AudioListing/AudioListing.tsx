import React, { useContext, useState, useEffect } from "react";
import he from "he";
import { GlobalContext } from "../../pages/_app";

import Icon from "../Icon/Icon";
import Button from "../Button/Button";

type Props = {
  src: string;
  id: any;
  title: string;
  date: string;
  favoriteCallback?: (id: string) => void;
};

type Progress = {
  playedSeconds: number;
  duration: number;
};

const AudioPlayer: React.FC<Props> = ({
  src,
  title,
  date,
  id,
  favoriteCallback,
}) => {
  const [progress, setProgress] = useState<Progress>({
    playedSeconds: 0,
    duration: 0,
  });
  const [favorite, setFavorite] = useState(false);

  const [publishDate, setPublishDate] = useState(
    new Date().toLocaleDateString("en-AU"),
  );

  const { globalContext, setGlobalContext } = useContext(GlobalContext);

  useEffect(() => {
    const storedProgress = localStorage.getItem(`${id}-progress`);
    const favoriteItems = JSON.parse(
      localStorage.getItem("favoriteItems") || "[]",
    );

    setFavorite(favoriteItems.includes(id));

    if (storedProgress) {
      setProgress(JSON.parse(storedProgress));
    }
    setPublishDate(new Date(date).toLocaleDateString("en-AU"));
  }, [src, id, globalContext, date]);

  const remainingTime = progress.duration - progress.playedSeconds;
  const remainingMinutes = Math.floor(remainingTime / 60);
  const remainingSeconds = Math.floor(remainingTime % 60);

  const toggleFavorite = (id: any) => {
    const favoriteItems = JSON.parse(
      localStorage.getItem("favoriteItems") || "[]",
    );

    const isFavorite = favoriteItems.includes(id);

    if (isFavorite) {
      const updatedItems = favoriteItems.filter((item: any) => item !== id);
      localStorage.setItem("favoriteItems", JSON.stringify(updatedItems));
    } else {
      favoriteItems.push(id);
      localStorage.setItem("favoriteItems", JSON.stringify(favoriteItems));
    }

    if (typeof favoriteCallback === "function") favoriteCallback(id);

    setFavorite(!isFavorite);
  };

  return (
    <div className="w-100 relative inline-flex w-full items-center border-b border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:text-white dark:focus:ring-gray-500">
      <Button onClick={() => toggleFavorite(id)}>
        <Icon
          className="me-2.5 h-3 w-3"
          name={"Favorite"}
          size={"sm"}
          variation={favorite ? "active" : "default"}
        />
      </Button>

      <div
        className="w-full"
        onClick={() => {
          console.log({ selectedItem: { title, date, src, id } });
          setGlobalContext((prev) => ({
            ...prev,
            selectedItem: { title, date, src, id },
          }));
        }}
      >
        {title && <h2>{he.decode(title)}</h2>}

        <p className="font-small mb-2 text-xs text-slate-300">{publishDate}</p>

        {progress.playedSeconds != 0 && (
          <div>
            <div>
              {/* <progress
                value={progress.playedSeconds}
                max={progress.duration}
              /> */}
              <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-200">
                <div
                  className="h-1.5 rounded-full bg-purple-600 dark:bg-purple-500"
                  style={{
                    width: `${
                      progress.playedSeconds / (progress.duration / 100)
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <span className="font-small mb-2 text-xs text-slate-300">
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

import { useContext, useState, useEffect, useCallback } from "react";

import he from "he"; // Importing he for HTML entity encoding/decoding
import { GlobalContext } from "../../pages/_app";

import Icon from "../Icon/Icon";
import Button from "../Button/Button";

// Props definition for the AudioPlayer component
type Props = {
  src: string;
  id: string;
  title: string;
  date: string;
  // eslint-disable-next-line no-unused-vars
  favoriteCallback?: (id?: string) => void; // Optional callback for favorite action
  categories?: any;
};

// Type definition for tracking audio progress
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
  categories,
}) => {
  // State for tracking progress of the audio
  const [progress, setProgress] = useState<Progress>({
    playedSeconds: 0,
    duration: 0,
  });
  const [favorite, setFavorite] = useState(false); // State to track if item is favorited

  // State for formatted publish date
  const [publishDate, setPublishDate] = useState(
    new Date().toLocaleDateString("en-AU"),
  );

  // Accessing global context
  const { globalContext, setGlobalContext } = useContext(GlobalContext);

  // Effect for loading progress and favorite status from localStorage
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

  // Calculating remaining time for display
  const remainingTime = progress.duration - progress.playedSeconds;
  const remainingMinutes = Math.floor(remainingTime / 60);
  const remainingSeconds = Math.floor(remainingTime % 60);

  // Function to toggle favorite status
  // Memoized toggleFavorite function
  const toggleFavorite = useCallback(
    (id: any) => {
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
    },
    [favoriteCallback],
  ); // Dependencies include favoriteCallback and any other props/state variables that the function depends on

  return (
    // Audio player component layout
    <div className="relative inline-flex w-full items-center border-b border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:text-white dark:focus:ring-gray-500">
      <Button onClick={() => toggleFavorite(id)}>
        <Icon
          className="me-2.5 h-3 w-3"
          name={"Favorite"}
          size={"sm"}
          variation={favorite ? "active" : "default"}
        />
      </Button>

      <div
        className="w-full cursor-pointer"
        onClick={() => {
          setGlobalContext((prev) => ({
            ...prev,
            selectedItem: { title, date, src, id },
          }));
        }}
      >
        {title && (
          <div>
            <h2 className="mb-2">{he.decode(title)}</h2>
            <span className="text-xs font-bold text-slate-300">
              Categories:
            </span>{" "}
            {categories.map((category: any, index: number) => {
              let name = category.name;
              // name.replace(" /", ", ");
              // console.log(name);
              return (
                <span
                  key={`category-${index}`}
                  className={[
                    "text-xs font-light italic text-slate-300",
                    // index === 0 ? "" : "ms-2",
                    // "inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10",
                  ].join(" ")}
                >
                  {index !== 0 && " / "} {he.decode(name)}
                </span>
              );
            })}
          </div>
        )}

        <p className="mb-2 text-xs text-slate-300">{publishDate}</p>

        {progress.playedSeconds != 0 && (
          // Display of the progress bar
          <div>
            <div>
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
            <span className="mb-2 text-xs text-slate-300">
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

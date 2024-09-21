import he from "he"; // Importing 'he' library for HTML entity encoding/decoding
import { useMemo } from "react"; // Importing useMemo from React to memoize values
import { AudioListingProps, Category } from "../../lib/types"; // Importing types for the component's props

/**
 * CategoryDisplay Component
 *
 * This component is responsible for rendering the list of categories associated
 * with the audio listing. It checks if categories exist and renders them in a
 * comma-separated list, ensuring proper HTML entity decoding where necessary.
 *
 * Props:
 * - categories: An array of category objects or undefined/null values.
 */
const CategoryDisplay: React.FC<{
  categories: Category[];
}> = ({ categories }) => {
  // If there are no categories or an empty array, return null (don't render anything)
  if (!categories || categories?.length === 0) return null;

  return (
    <span className="text-xs font-bold text-slate-300">
      Categories:{" "}
      {categories.map((category, index) => {
        if (!category?.name) return null; // Skip null/undefined categories

        return (
          <span
            key={`category-${index}`}
            className="text-xs font-light italic text-slate-300"
          >
            {/* Add a separator for multiple categories */}
            {index !== 0 && " / "}
            {/* Decode and display the category name */}
            {he.decode(category.name)}
          </span>
        );
      })}
    </span>
  );
};

/**
 * ProgressBar Component
 *
 * This component handles the display of the audio progress bar, showing how much
 * of the audio has been played as well as the remaining time in minutes and seconds.
 *
 * Props:
 * - playedSeconds: Number of seconds already played.
 * - duration: Total duration of the audio file in seconds.
 */
const ProgressBar: React.FC<{ playedSeconds: number; duration: number }> = ({
  playedSeconds,
  duration,
}) => {
  // Calculate the remaining time by subtracting playedSeconds from the total duration
  const remainingTime = duration - playedSeconds;
  // Convert the remaining time into minutes and seconds
  const remainingMinutes = Math.floor(remainingTime / 60);
  const remainingSeconds = Math.floor(remainingTime % 60);

  return (
    <div>
      {/* Progress bar container */}
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-200">
        {/* The progress bar itself with width as a percentage of total duration */}
        <div
          className="h-1.5 rounded-full bg-purple-600 dark:bg-purple-500"
          style={{ width: `${(playedSeconds / duration) * 100}%` }} // Calculate width as percentage of total duration
        ></div>
      </div>
      {/* Display the remaining time in "minutes:seconds" format */}
      <span className="mb-2 text-xs text-slate-300">
        {remainingMinutes}m {remainingSeconds.toString().padStart(2, "0")}s left
      </span>
    </div>
  );
};

/**
 * AudioListing Component
 *
 * This is the main component responsible for rendering a single audio listing item.
 * It shows the title, publish date, categories, progress bar (if the audio has
 * started playing), and handles click events to trigger a modal via a callback.
 *
 * Props:
 * - title: The title of the audio content (string).
 * - date: The publish date of the audio content (string in ISO format).
 * - categories: An array of categories associated with the audio (Category[]).
 * - setModalCallback: Callback function to trigger a modal window (function).
 * - children: JSX children to be rendered inside the component.
 * - playedSeconds: The number of seconds already played (number).
 * - duration: Total duration of the audio file in seconds (number).
 */
const AudioListing: React.FC<AudioListingProps> = ({
  title,
  date,
  categories = [],
  setModalCallback,
  children,
  playedSeconds,
  duration,
}) => {
  // Memoize the formatted date to avoid recalculating on every render.
  // It will only recalculate if the 'date' prop changes.
  const publishDate = useMemo(
    () => new Date(date).toLocaleDateString("en-AU"),
    [date],
  );

  // Boolean to check if any audio has been played (for conditional rendering of the progress bar)
  const hasPlayed = playedSeconds > 0;

  return (
    // Main container for the audio listing. Adds hover effects, focus styles, and handles click events.
    <div
      className={[
        "relative inline-flex w-full items-center border-b px-4 py-2 text-sm font-medium focus:z-10 focus:ring-2",
        "border-gray-600 hover:bg-gray-600 hover:text-white focus:text-white focus:ring-gray-500",
      ].join(" ")}
      onClick={() => {
        // Trigger the modal callback function if it exists
        if (typeof setModalCallback === "function") setModalCallback();
      }}
    >
      {children}{" "}
      {/* Any additional elements passed via children will be rendered here */}
      <div className="w-full cursor-pointer">
        {/* Render the title if it exists, using 'he.decode' to handle any encoded HTML entities */}
        {title && (
          <div>
            <h2 className="mb-2">{he.decode(title)}</h2>
            {/* Render the CategoryDisplay component with the provided categories */}
            <CategoryDisplay categories={categories} />
          </div>
        )}

        {/* Render the formatted publish date */}
        {publishDate && (
          <p className="mb-2 text-xs text-slate-300">{publishDate}</p>
        )}

        {/* Conditionally render the progress bar if any audio has been played */}
        {hasPlayed && (
          <ProgressBar playedSeconds={playedSeconds} duration={duration} />
        )}
      </div>
    </div>
  );
};

export default AudioListing;

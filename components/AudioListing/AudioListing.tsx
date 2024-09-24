import he from "he"; // Library for HTML entity encoding/decoding
import { useMemo } from "react"; // useMemo hook from React to memoize values
import { AudioListingProps, Category } from "../../lib/types"; // Importing types for component props

/**
 * CategoryDisplay Component
 *
 * Renders a list of categories associated with an audio listing.
 * If no categories are provided, it returns null.
 * Props:
 * - categories: An array of Category objects.
 */
const CategoryDisplay: React.FC<{
  categories: Category[];
}> = ({ categories }) => {
  // Return null if there are no categories or if the array is empty
  if (!categories || categories?.length === 0) return null;

  return (
    <span className="text-xs font-bold text-slate-300">
      Categories:{" "}
      {categories.map((category, index) => {
        if (!category?.name) return null; // Skip categories with null/undefined names

        return (
          <span
            key={`category-${index}`} // Unique key for each category
            className="text-xs font-light italic text-slate-300"
          >
            {/* Add a separator between categories */}
            {index !== 0 && " / "}
            {/* Decode and display category name */}
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
 * Renders an audio progress bar and displays the remaining time in "minutes:seconds" format.
 * Props:
 * - playedSeconds: Number of seconds already played.
 * - duration: Total duration of the audio in seconds.
 */
const ProgressBar: React.FC<{ playedSeconds: number; duration: number }> = ({
  playedSeconds,
  duration,
}) => {
  // Calculate remaining time by subtracting playedSeconds from duration
  const remainingTime = duration - playedSeconds;
  // Convert remaining time into minutes and seconds
  const remainingMinutes = Math.floor(remainingTime / 60);
  const remainingSeconds = Math.floor(remainingTime % 60);

  return (
    <div>
      {/* Progress bar container */}
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-200">
        {/* Progress bar itself, width is percentage of the played time */}
        <div
          className="h-1.5 rounded-full bg-purple-600 dark:bg-purple-500"
          style={{ width: `${(playedSeconds / duration) * 100}%` }} // Calculate width as percentage
        ></div>
      </div>
      {/* Display remaining time in "minutes:seconds" format */}
      <span className="mb-2 text-xs text-slate-300">
        {remainingMinutes}m {remainingSeconds.toString().padStart(2, "0")}s left
      </span>
    </div>
  );
};

/**
 * AudioListing Component
 *
 * Renders a single audio listing item, including the title, publish date, categories, and progress bar.
 * Handles click events to trigger a modal via a callback.
 * Props:
 * - title: The title of the audio content.
 * - date: The publish date of the audio content.
 * - categories: An array of Category objects associated with the audio.
 * - setModalCallback: Callback function to trigger a modal.
 * - children: JSX elements to be rendered inside the component.
 * - playedSeconds: Number of seconds already played.
 * - duration: Total duration of the audio.
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
  // Memoize the formatted date to avoid recalculating on every render
  const publishDate = useMemo(
    () => new Date(date).toLocaleDateString("en-AU"),
    [date],
  );

  // Boolean to check if the audio has been played (for conditionally rendering the progress bar)
  const hasPlayed = playedSeconds > 0;

  return (
    // Main container for the audio listing with hover and focus effects
    <div
      className={[
        "relative inline-flex w-full items-center border-b px-4 py-2 text-sm font-medium focus:z-10 focus:ring-2",
        "border-gray-600 hover:bg-gray-600 hover:text-white focus:text-white focus:ring-gray-500",
      ].join(" ")}
    >
      {children} {/* Render any passed children here */}
      <div
        className="w-full cursor-pointer"
        onClick={() => {
          // Trigger modal callback if defined
          if (typeof setModalCallback === "function") setModalCallback();
        }}
        onKeyDown={(event) =>
          event.key === "Enter" &&
          typeof setModalCallback === "function" &&
          setModalCallback()
        } // Handle Enter key for accessibility
        tabIndex={0} // Make the element focusable
      >
        {/* Title */}
        {title && (
          <div>
            <h2 className="mb-2">{he.decode(title)}</h2>{" "}
            {/* Decode HTML entities in title */}
            {/* Render categories */}
            <CategoryDisplay categories={categories} />
          </div>
        )}

        {/* Publish date */}
        {publishDate && (
          <p className="mb-2 text-xs text-slate-300">{publishDate}</p>
        )}

        {/* Progress bar */}
        {hasPlayed && (
          <ProgressBar playedSeconds={playedSeconds} duration={duration} />
        )}
      </div>
    </div>
  );
};

export default AudioListing;

/**
 * Possible Refactoring Ideas:
 * 1. **Memoization**: Consider memoizing the `CategoryDisplay` and `ProgressBar` components to avoid unnecessary re-renders if their props do not change.
 * 2. **Accessibility Improvements**: Add more ARIA attributes, such as `aria-labels` for interactive elements, and test for screen reader compatibility.
 * 3. **TypeScript Enhancement**: Use stronger TypeScript types for `setModalCallback` and `categories` to improve type safety.
 * 4. **Lazy Load Components**: For performance optimization, consider lazy loading the `ProgressBar` and `CategoryDisplay` components if they are only rendered conditionally.
 * 5. **Error Handling**: Add error handling for cases where the `date` or `duration` props might be undefined or invalid.
 */

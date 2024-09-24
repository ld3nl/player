import React from "react"; // Importing React for JSX support
import { DurationProps } from "@/lib/types"; // Importing the type for the component's props

/**
 * Duration Component
 *
 * This component is responsible for formatting and displaying the duration of audio/video content.
 * It takes seconds as input, formats them into "mm:ss" format, and renders them within a <time> element.
 * Props:
 * - className: Custom class names for styling the <time> element.
 * - seconds: The duration in seconds to be formatted and displayed.
 */
export const Duration: React.FC<DurationProps> = ({ className, seconds }) => {
  /**
   * Helper function to format time into "mm:ss" format.
   * Converts the given time (in seconds) to a string format representing minutes and seconds.
   */
  const format = (time: number) => {
    const date = new Date(time * 1000); // Convert seconds to milliseconds and create a Date object
    const mm = pad(date.getUTCMinutes()); // Get the minutes and pad if necessary
    const ss = pad(date.getUTCSeconds()); // Get the seconds and pad if necessary
    return `${mm}:${ss}`; // Return formatted string
  };

  /**
   * Helper function to pad single-digit numbers with a leading zero.
   * Ensures that numbers less than 10 are displayed with two digits (e.g., 9 becomes "09").
   */
  const pad = (value: number) => {
    return value < 10 ? `0${value}` : `${value}`; // Pad value if it's less than 10
  };

  return (
    // Render the formatted duration within a <time> element for semantic HTML
    <time dateTime={`P${Math.round(seconds)}S`} className={className}>
      {format(seconds)}
    </time>
  );
};

/**
 * Possible Refactoring Ideas:
 * 1. **Memoization**: Consider memoizing the `format` function using `useMemo` to avoid recalculating the formatted time unnecessarily.
 * 2. **TypeScript Enhancements**: Use stricter types for the `seconds` prop (e.g., ensuring it is a non-negative number).
 * 3. **Localization**: If the project scales globally, consider using a more advanced time formatting library (e.g., `date-fns` or `moment.js`) to handle localization and more complex time formats.
 * 4. **Accessibility Enhancements**: Add `aria-label` to the `<time>` element to describe the time in a more accessible way for screen readers (e.g., "Duration: 2 minutes and 30 seconds").
 * 5. **Edge Case Handling**: Add error handling or validation to ensure that `seconds` is a valid number and handle potential edge cases like negative values.
 */

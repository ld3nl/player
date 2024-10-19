import * as React from "react"; // Import React
import { getSVG } from "./getIcon"; // Function to retrieve SVG based on the name

import { IconProps, SVGProps, SVGIconName } from "../../lib/types"; // Import types for props and SVG

/**
 * Icon Component
 *
 * This component renders an SVG icon based on the provided props.
 * It supports various sizes, variations (active/default), and customizations.
 * Props:
 * - className: Optional additional classes to apply to the icon.
 * - name: The name of the SVG icon to render (default is "Play").
 * - size: The size of the icon ("sm", "md", "twoThirds").
 * - variation: The variation of the icon (default or active state).
 * - customVariation: Custom colors for active/default states.
 * - customSize: Allows setting a custom size for the icon.
 */
const Icon: React.FunctionComponent<IconProps> = ({
  className = "",
  name = SVGIconName.Play, // Default to "Play" icon
  size = "md", // Default size is "md"
  variation = "default", // Default variation is "default"
  customVariation = { active: "fill-purple-600", default: "fill-blue-100" }, // Default color variations
  customSize = "", // Custom size is optional
}) => {
  // Set up the props to be passed to the getSVG function
  const svgProps: SVGProps = { name };
  let viewBox = "0 0 120 120"; // Default viewBox size for most icons

  // Adjust viewBox based on the specific icon name
  if (name === "Close") viewBox = "0 0 16 16";
  if (
    name === "ForwardRewind" ||
    name === "BackwardRewind" ||
    name === "Link" ||
    name === "LinkSimple" ||
    name === "ArrowLeft"
  )
    viewBox = "0 0 256 256";

  if (name === "Spinner") {
    className = `${className} animate-spin`; // Add spinning animation for the spinner icon
    viewBox = "0 0 24 24"; // Smaller viewBox for the spinner
  }

  // Define the available sizes for the icon
  const sizes = {
    sm: "h-8 w-8", // Small size (8x8)
    md: "h-10 w-10", // Medium size (10x10)
    twoThirds: "h-2/3 w-2/3", // Two-thirds size (relative to parent element)
  };

  // Render the icon using the appropriate SVG and styles
  return (
    <span
      className={[
        className, // Apply additional classes if provided
        "relative", // Position relative to allow customizations
        customSize
          ? `h-${customSize} w-${customSize}` // Custom size if provided
          : sizes[size as keyof typeof sizes], // Default size based on the "size" prop
      ].join(" ")}
    >
      <svg
        className={[
          "h-auto w-full", // Ensure the SVG scales with the container
          variation === "active"
            ? customVariation.active // Apply active variation color
            : customVariation.default, // Apply default variation color
        ].join(" ")}
        xmlns="http://www.w3.org/2000/svg" // SVG namespace
        xmlnsXlink="http://www.w3.org/1999/xlink" // XLink namespace for referencing external resources
        viewBox={viewBox} // Set the viewBox based on the icon name
        preserveAspectRatio="xMidYMid meet" // Preserve aspect ratio
      >
        {getSVG(svgProps)}{" "}
        {/* Render the appropriate SVG path based on the icon name */}
      </svg>
    </span>
  );
};

export default Icon;

/**
 * Possible Refactoring Ideas:
 * 1. **Memoization**: Memoize the `getSVG` function call using `React.useMemo` to prevent unnecessary re-renders when the `name` prop doesn't change.
 * 2. **CustomSize Validation**: Add validation to ensure that `customSize` values are valid CSS size units to avoid potential rendering issues.
 * 3. **TypeScript Enhancement**: Improve type safety for `customSize` by defining stricter types or constraints for valid size values.
 * 4. **Lazy Loading SVGs**: If the number of SVG icons grows, consider lazy-loading SVGs to optimize performance, especially if they are only conditionally rendered.
 * 5. **ARIA Enhancements**: Ensure the component is accessible by adding ARIA attributes like `role="img"` and possibly `aria-label` for better screen reader support.
 */

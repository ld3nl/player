import * as React from "react";
import { getSVG, SVGProps } from "./getIcon";

// Define the types of icons available in your application
type SVGIconName =
  | "Play"
  | "ForwardRewind"
  | "BackwardRewind"
  | "Pause"
  | "Close"
  | "Favorite";

// Props interface for the Icon component
interface IconProps {
  className?: string; // Optional className for styling
  name: SVGIconName; // Name of the icon to be rendered
  size?: "sm" | "md"; // Optional size of the icon, with default sizes available
  variation?: "active" | "default"; // Optional variation for different icon styles
  customVariation?: { active: string; default: string }; // Optional custom variation for more control
  customSize?: string; // Optional custom size for exact sizing
}

// Icon component definition
const Icon: React.FunctionComponent<IconProps> = ({
  className = "",
  name,
  size = "md",
  variation = "default",
  customVariation = { active: "fill-purple-600", default: "fill-blue-100" },
  customSize,
}) => {
  const svgProps: SVGProps = { name }; // Properties passed to the getSVG function
  let viewBox = "0 0 120 120"; // Default viewBox size

  // Adjusting viewBox based on the icon name
  if (name === "Close") viewBox = "0 0 16 16";
  if (name === "ForwardRewind" || name === "BackwardRewind")
    viewBox = "0 0 256 256";

  // Rendering the SVG element
  return (
    <svg
      className={[
        className,
        customSize
          ? `h-${customSize} w-${customSize}`
          : size === "sm"
            ? "h-8 w-8"
            : "h-10 w-10",
        variation === "active"
          ? customVariation.active
          : customVariation.default,
      ].join(" ")}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
    >
      {getSVG(svgProps)}
    </svg>
  );
};

export default Icon;

import * as React from "react";
import { getSVG, SVGProps } from "./getIcon";

// Define the types of icons available in your application
type SVGIconName =
  | "Play"
  | "ForwardRewind"
  | "BackwardRewind"
  | "Pause"
  | "Close"
  | "Favorite"
  | "Spinner"
  | "Link";

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
  if (name === "ForwardRewind" || name === "BackwardRewind" || name === "Link")
    viewBox = "0 0 256 256";

  if (name === "Spinner") {
    className = `${className} animate-spin`;
    viewBox = "0 0 24 24";
  }

  // Rendering the SVG element
  return (
    <span
      className={[
        className,
        "relative",
        customSize
          ? `h-${customSize} w-${customSize}`
          : size === "sm"
            ? "h-8 w-8"
            : "h-10 w-10",
      ].join(" ")}
    >
      <svg
        className={[
          "h-auto w-full",
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
    </span>
  );
};

export default Icon;

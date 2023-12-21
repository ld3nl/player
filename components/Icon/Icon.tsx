import * as React from "react";
import { getSVG, SVGProps } from "./getIcon";

type SVGIconName =
  | "Play"
  | "ForwardRewind"
  | "BackwardRewind"
  | "Pause"
  | "Close"
  | "Favorite";

interface IconProps {
  className?: string;
  name: SVGIconName;
  size?: "sm" | "md";
  variation?: "active" | "default";
  customVariation?: { active: string; default: string };
}

const Icon: React.FunctionComponent<IconProps> = ({
  className = "",
  name,
  size = "md",
  variation = "default",
  customVariation = { active: "fill-purple-600", default: "fill-blue-100" },
}) => {
  const svgProps: SVGProps = { name };
  let viewBox = "0 0 120 120";

  if (name === "Close") viewBox = "0 0 16 16";

  return (
    <svg
      className={[
        className,
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
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

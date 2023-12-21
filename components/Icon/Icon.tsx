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
  customSize?: string;
}

const Icon: React.FunctionComponent<IconProps> = ({
  className = "",
  name,
  size = "md",
  variation = "default",
  customVariation = { active: "fill-purple-600", default: "fill-blue-100" },
  customSize,
}) => {
  const svgProps: SVGProps = { name };
  let viewBox = "0 0 120 120";

  if (name === "Close") viewBox = "0 0 16 16";
  if (name === "ForwardRewind" || name === "BackwardRewind")
    viewBox = "0 0 256 256";

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

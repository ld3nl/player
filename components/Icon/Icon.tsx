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
}

const Icon: React.FunctionComponent<IconProps> = ({
  className = "",
  name,
  size = "md",
  variation = "default",
}) => {
  const svgProps: SVGProps = { name };
  let viewBox = "0 0 120 120";

  if (name === "Close") viewBox = "0 0 16 16";

  return (
    <svg
      className={[
        className,
        size === "sm" ? "w-8 h-8" : "w-10 h-10",
        variation === "active" ? "fill-purple-600" : "fill-blue-100 ",
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

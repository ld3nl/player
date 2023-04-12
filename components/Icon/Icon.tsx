import * as React from "react";
import { getSVG, SVGProps } from "./getIcon";
import css from "./Icon.module.scss";

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
    <span
      className={[
        css.Icon,
        css[size],
        css[name],
        css[variation],
        className,
      ].join(" ")}
    >
      <svg
        className={`${className}`}
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

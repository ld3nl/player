import { Button as HeadlessButton } from "@headlessui/react";
import { cn } from "cnfast";
import type { ButtonProps } from "@/lib/types";

type ControlProps = ButtonProps & {
  variant?: "ghost" | "secondary" | "primary" | "inverse";
  size?: "icon" | "label" | "play";
};

const Button = ({
  className,
  children,
  ariaLabel,
  variant = "ghost",
  size = "icon",
  type = "button",
  title = ariaLabel,
  ...props
}: ControlProps) => (
  <HeadlessButton
    type={type}
    className={cn("ui-control", className)}
    data-variant={variant}
    data-size={size}
    aria-label={ariaLabel}
    title={title}
    {...props}
  >
    {children}
  </HeadlessButton>
);

export default Button;

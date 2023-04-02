import React, { ButtonHTMLAttributes } from "react";
import css from "./Button.module.scss";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

const Button: React.FC<ButtonProps> = ({ className, children, ...props }) => {
  return (
    <button className={[css.button, className].join(" ")} {...props}>
      {children}
    </button>
  );
};

export default Button;

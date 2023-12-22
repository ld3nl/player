import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

const Button: React.FC<ButtonProps> = ({ className, children, ...props }) => {
  return (
    <button className={[className].join(" ")} {...props}>
      {children}
    </button>
  );
};

export default Button;

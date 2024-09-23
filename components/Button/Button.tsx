import { ButtonProps } from "../../lib/types";

const Button: React.FC<ButtonProps> = ({
  className,
  children,
  ariaLabel,
  ...props
}) => {
  return (
    <button className={[className].join(" ")} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  );
};

export default Button;

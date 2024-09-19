import { ButtonProps } from "../../lib/types";

const Button: React.FC<ButtonProps> = ({ className, children, ...props }) => {
  return (
    <button className={[className].join(" ")} {...props}>
      {children}
    </button>
  );
};

export default Button;

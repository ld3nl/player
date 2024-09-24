import { ButtonProps } from "../../lib/types"; // Import ButtonProps type for the component

/**
 * Button Component
 *
 * A reusable button component that accepts custom classes, children elements,
 * and ARIA labels for accessibility.
 * Props:
 * - className: Custom class names for styling the button.
 * - children: The content inside the button (text, icons, etc.).
 * - ariaLabel: ARIA label for screen readers (important for accessibility).
 * - ...props: Spread operator to accept other standard button properties (e.g., onClick, disabled).
 */
const Button: React.FC<ButtonProps> = ({
  className,
  children,
  ariaLabel,
  ...props // Spread props to allow for other standard button attributes like onClick
}) => {
  return (
    // Render a button with the passed class names and props, including aria-label for accessibility
    <button className={[className].join(" ")} aria-label={ariaLabel} {...props}>
      {children} {/* Render the button's children (text, icons, etc.) */}
    </button>
  );
};

export default Button;

/**
 * Possible Refactoring Ideas:
 * 1. **TypeScript Enhancements**: Improve type safety by adding stricter types for `className` and `ariaLabel` to ensure they follow specific formats (e.g., `ariaLabel` must be a string).
 * 2. **Memoization**: If the component becomes complex with additional logic, memoize it with `React.memo` to prevent unnecessary re-renders.
 * 3. **Default Props**: Provide default values for `ariaLabel` or `className` to ensure the button always has necessary attributes for accessibility and styling.
 * 4. **Accessibility Enhancements**: Automatically enforce `ariaLabel` as required, and potentially add `role="button"` for better screen reader support in non-native button contexts.
 * 5. **ClassName Handling**: Improve `className` handling by using a utility like `clsx` or `classnames` to avoid issues when conditionally applying multiple classes.
 */

// app/layout.tsx

import "./styles/globals.css"; // Import global styles for the entire application
import { ReactNode } from "react"; // Import the ReactNode type for defining the shape of children props

/**
 * Metadata configuration for the application.
 * Includes title and description for SEO purposes.
 */
export const metadata = {
  title: "Paul Lowe Talks source https://www.paullowe.org", // Default title for the application
  description:
    "Paul Lowe Talks source https://www.paullowe.org, player stores your progress", // Meta description for SEO and social media previews
};

/**
 * Viewport settings to control the scaling and responsiveness of the application on mobile devices.
 * - width: Set to device width for proper scaling on mobile.
 * - initialScale: Ensures the page is scaled correctly when loaded.
 * - maximumScale: Limits the maximum zoom level.
 * - userScalable: Allows users to zoom in and out.
 * - minimalUi: Ensures minimal UI on mobile browsers (available in certain browsers).
 */
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: "yes",
  minimalUi: true,
};

/**
 * RootLayout Component
 *
 * This component serves as the layout wrapper for the entire application.
 * It ensures the proper HTML structure and applies necessary attributes like lang and class names.
 *
 * Props:
 * - children: The content of the page that will be rendered inside the layout.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="group">
      {/* The lang attribute helps set the language for the document (English in this case). */}
      <body className="group-has-open:overflow-hidden group-has-open:overscroll-none">
        {/* Render the children inside the <body> tag, with the full height applied via className. */}
        {children}
      </body>
    </html>
  );
}

/**
 * Possible Refactoring Ideas:
 * 1. **Dynamic Metadata**: Make the metadata (title, description) dynamic based on the specific page being viewed, using Next.js Head or a similar feature.
 * 2. **Accessibility Enhancements**: Ensure better accessibility by adding additional attributes like `aria-label` or `<meta>` tags for viewport and charset if necessary.
 * 3. **TypeScript Enhancements**: Use a stronger type definition for the `children` prop, such as `ReactElement | ReactNode` for stricter type safety.
 * 4. **Performance Optimization**: Implement preloading of critical assets like fonts and scripts to enhance performance.
 * 5. **SEO Enhancements**: Consider adding more meta tags for Open Graph, Twitter Cards, or favicons to further enhance SEO and social media integration.
 */

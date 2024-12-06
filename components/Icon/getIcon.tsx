import { SVGProps } from "@/lib/types"; // Importing type definitions for SVGProps

/**
 * getSVG Function
 *
 * This function returns the appropriate SVG element based on the provided `name` prop.
 * Each case represents a different SVG icon that can be used in the application.
 *
 * Props:
 * - name: The name of the SVG to render (e.g., "Play", "Pause", "Close").
 */
export function getSVG({ name }: SVGProps) {
  switch (name) {
    case "Spinner":
      return (
        <>
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="fill-purple-600"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="fill-purple-600"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </>
      );
    case "Play":
      return (
        <>
          <path d="M81.35,55.76,51.46,38.5a4.9,4.9,0,0,0-7.35,4.25v34.5a4.9,4.9,0,0,0,7.35,4.25L81.35,64.24A4.9,4.9,0,0,0,81.35,55.76Z" />
        </>
      );
    case "ForwardRewind":
      return (
        <>
          <path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm88-24a8,8,0,0,0-8,8V82c-6.35-7.36-12.83-14.45-20.12-21.83a96,96,0,1,0-2,137.7,8,8,0,0,0-11-11.64A80,80,0,1,1,184.54,71.4C192.68,79.64,199.81,87.58,207,96H184a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V64A8,8,0,0,0,224,56Z"></path>
        </>
      );
    case "BackwardRewind":
      return (
        <>
          <path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm-8-48A95.44,95.44,0,0,0,60.08,60.15C52.81,67.51,46.35,74.59,40,82V64a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16H49c7.15-8.42,14.27-16.35,22.39-24.57a80,80,0,1,1,1.66,114.75,8,8,0,1,0-11,11.64A96,96,0,1,0,128,32Z"></path>
        </>
      );
    case "Pause":
      return (
        <>
          <rect height="44.92" rx="4.2" width="8.68" x="44.66" y="37.54" />
          <rect
            strokeWidth="2px"
            height="44.92"
            rx="4.2"
            width="8.68"
            x="66.66"
            y="37.54"
          />
        </>
      );
    case "Favorite":
      return (
        <>
          <path d="M47.24,35.4h3.68a16.9,16.9,0,0,1,8.52,3.69.75.75,0,0,0,1.11,0,17,17,0,0,1,8.53-3.68h3.68A18.16,18.16,0,0,1,79.7,38,16.56,16.56,0,0,1,87,49.42V54c-.81,4.31-3.15,7.67-6.26,10.69-6.31,6.13-12.48,12.42-18.7,18.64a6.87,6.87,0,0,1-1.49,1.25H59.43a6.92,6.92,0,0,1-1.57-1.33c-6.33-6.33-12.61-12.71-19-19A18.72,18.72,0,0,1,33,53.79v-4.6a17.85,17.85,0,0,1,4.09-8.47A17.11,17.11,0,0,1,47.24,35.4Z" />
        </>
      );
    case "Close":
      return (
        <>
          <path d="M15.3536 15.3536C15.1583 15.5488 14.8417 15.5488 14.6465 15.3536L0.830255 1.53736C0.634993 1.3421 0.634993 1.02552 0.830255 0.830254C1.02552 0.634992 1.3421 0.634992 1.53736 0.830254L15.3536 14.6464C15.5488 14.8417 15.5488 15.1583 15.3536 15.3536Z" />
          <path d="M0.830254 15.3536C0.634992 15.1583 0.634992 14.8417 0.830254 14.6465L14.6465 0.830255C14.8417 0.634993 15.1583 0.634993 15.3536 0.830255C15.5488 1.02552 15.5488 1.3421 15.3536 1.53736L1.53736 15.3536C1.3421 15.5488 1.02552 15.5488 0.830254 15.3536Z" />
        </>
      );
    case "Link":
      return (
        <>
          <path d="M137.54,186.36a8,8,0,0,1,0,11.31l-9.94,10A56,56,0,0,1,48.38,128.4L72.5,104.28A56,56,0,0,1,149.31,102a8,8,0,1,1-10.64,12,40,40,0,0,0-54.85,1.63L59.7,139.72a40,40,0,0,0,56.58,56.58l9.94-9.94A8,8,0,0,1,137.54,186.36Zm70.08-138a56.08,56.08,0,0,0-79.22,0l-9.94,9.95a8,8,0,0,0,11.32,11.31l9.94-9.94a40,40,0,0,1,56.58,56.58L172.18,140.4A40,40,0,0,1,117.33,142,8,8,0,1,0,106.69,154a56,56,0,0,0,76.81-2.26l24.12-24.12A56.08,56.08,0,0,0,207.62,48.38Z"></path>
        </>
      );
    case "LinkSimple":
      return (
        <>
          {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><line x1="96" y1="160" x2="160" y2="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" stroke-width="16"/></svg>      */}
          <path
            d="M112,76.11l30.06-30a48,48,0,0,1,67.88,67.88L179.88,144"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="16"
          />
          <path
            d="M76.11,112l-30,30.06a48,48,0,0,0,67.88,67.88L144,179.88"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="16"
          />
        </>
      );

    case "ArrowLeft":
      return (
        <>
          {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"></svg> */}
          <rect width="256" height="256" fill="none" />
          <line
            x1="216"
            y1="128"
            x2="40"
            y2="128"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="16"
          />
          <polyline
            points="112 56 40 128 112 200"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="16"
          />
        </>
      );
    case "Headphones":
      return (
        <>
          <rect width="256" height="256" fill="none" />
          <path
            d="M224,128H192a16,16,0,0,0-16,16v40a16,16,0,0,0,16,16h16a16,16,0,0,0,16-16V128a96,96,0,1,0-192,0v56a16,16,0,0,0,16,16H64a16,16,0,0,0,16-16V144a16,16,0,0,0-16-16H32"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="16"
          />
        </>
      );
    case "CheckedCircle":
      return (
        <>
          <rect width="256" height="256" fill="none" />
          <polyline
            points="88 136 112 160 168 104"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="16"
          />
          <circle
            cx="128"
            cy="128"
            r="96"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="16"
          />
        </>
      );
    default:
      console.warn(`Unknown icon name: ${name}`);
      return null; // or return a default icon
  }
}

/**
 * Possible Refactoring Ideas:
 * 1. **SVG Icons Management**: If the number of icons grows, consider refactoring the icons into a separate file for each, using dynamic imports to only load the necessary SVGs at runtime.
 * 2. **Memoization**: Use `React.memo` or `useMemo` to prevent re-rendering of SVGs that do not change often. This can help optimize performance in components that use the same SVG multiple times.
 * 3. **Default Case Handling**: Add logging in the default case to catch any undefined or missing icon names to improve debugging.
 * 4. **Accessibility Improvements**: Consider adding `title` or `desc` tags inside the SVG for accessibility, making the icons more descriptive for screen readers.
 * 5. **Error Handling**: Throw a custom error or warning if an unsupported `name` is provided, helping developers catch typos or incorrect usage early.
 */

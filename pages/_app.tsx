import type { AppProps } from "next/app";
import "../styles/index.css";

// import { createContext, useState } from "react";
// import { GlobalContextValue } from "@/lib/types";

// Defines the shape of the global context data.
// TODO: Consider splitting this context if different parts are used independently in the app.

// const DEFAULT_GLOBAL_CONTEXT: GlobalContextValue = {
//   isModalActive: false,
//   selectedItem: { title: "", date: "", src: "", id: 0 },
// };

// Creates a global context for managing application-wide state.
// TODO: Refactor to use a constant for the default state to avoid repetition.
// export const GlobalContext = createContext<{
//   globalContext: GlobalContextValue;
//   setGlobalContext: React.Dispatch<React.SetStateAction<GlobalContextValue>>;
// }>({
//   // Initial value for the global context.
//   globalContext: DEFAULT_GLOBAL_CONTEXT,
//   // A placeholder function for setting the global context, to be overridden by the Provider.
//   // Best Practice: Consider throwing an error or a warning in this default function to indicate misuse.
//   setGlobalContext: () => {
//     throw new Error(
//       "setGlobalContext must be overridden by the GlobalContext.Provider",
//     );
//   },
// });

// The main app component.
export default function MyApp({ Component, pageProps }: AppProps) {
  // State hook for managing the global context. This state will be accessible to all child components.
  // Best Practice: Use a constant for the initial state to maintain consistency and DRY code.

  // const [globalContext, setGlobalContext] = useState({
  //   ...DEFAULT_GLOBAL_CONTEXT,
  // });

  return (
    // GlobalContext.Provider makes the global context available to all child components.
    // Best Practice: Provide a clear and concise context value.

    // <GlobalContext.Provider value={{ globalContext, setGlobalContext }}>
    <Component {...pageProps} />
    // </GlobalContext.Provider>
  );
}

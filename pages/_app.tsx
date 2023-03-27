import "@/styles/globals.scss";
import type { AppProps } from "next/app";

import { createContext, useState } from "react";

export const GlobalContext = createContext<{
  globalContext: {
    isModalActive: boolean;
  };
  setGlobalContext: React.Dispatch<
    React.SetStateAction<{
      isModalActive: boolean;
    }>
  >;
}>({
  globalContext: {
    isModalActive: false,
  },
  setGlobalContext: () => {},
});

export default function MyApp({ Component, pageProps }: AppProps) {
  const [globalContext, setGlobalContext] = useState({
    isModalActive: false,
  });

  return (
    <GlobalContext.Provider value={{ globalContext, setGlobalContext }}>
      <Component {...pageProps} />
    </GlobalContext.Provider>
  );
}

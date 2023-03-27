import "@/styles/globals.scss";
import type { AppProps } from "next/app";

import { createContext, useState } from "react";

export const GlobalContext = createContext<{
  globalContext: {
    isModalActive: boolean;
    selectedItem: { title: string; date: string; src: string; id: string };
  };
  setGlobalContext: React.Dispatch<
    React.SetStateAction<{
      isModalActive: boolean;
      selectedItem: { title: string; date: string; src: string; id: string };
    }>
  >;
}>({
  globalContext: {
    isModalActive: false,
    selectedItem: { title: "", date: "", src: "", id: "" },
  },
  setGlobalContext: () => {},
});

export default function MyApp({ Component, pageProps }: AppProps) {
  const [globalContext, setGlobalContext] = useState({
    isModalActive: false,
    selectedItem: { title: "", date: "", src: "", id: "" },
  });

  return (
    <GlobalContext.Provider value={{ globalContext, setGlobalContext }}>
      <Component {...pageProps} />
    </GlobalContext.Provider>
  );
}

import type { AppProps } from "next/app";
import "../styles/index.css";

import { createContext, useState } from "react";

type GlobalContextValue = {
  isModalActive: boolean;
  selectedItem: { title: string; date: string; src: string; id: string };
};

export const GlobalContext = createContext<{
  globalContext: GlobalContextValue;
  setGlobalContext: React.Dispatch<React.SetStateAction<GlobalContextValue>>;
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

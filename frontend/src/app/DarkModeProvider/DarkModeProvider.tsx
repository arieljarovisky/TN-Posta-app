import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ThemeProvider } from "@nimbus-ds/styles";

interface IDarkModeContext {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const DarkModeContext = createContext<IDarkModeContext>(null as never);

interface IDarkModeProvider {
  children: ReactNode;
}

export const DarkModeProvider = ({ children }: IDarkModeProvider) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = useCallback(
    () => setDarkMode((prevState) => !prevState),
    []
  );

  const contextValue = useMemo(
    () => ({ darkMode, toggleDarkMode }),
    [darkMode, toggleDarkMode]
  );

  useEffect(() => {
    const storageValue = localStorage.getItem("darkMode");

    if (storageValue) {
      setDarkMode(JSON.parse(storageValue));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <DarkModeContext.Provider value={contextValue}>
      <ThemeProvider theme="base">{children}</ThemeProvider>
    </DarkModeContext.Provider>
  );
};

export default DarkModeProvider;

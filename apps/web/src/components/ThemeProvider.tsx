"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Load saved theme
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) {
      setThemeState(saved);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    function resolveTheme() {
      if (theme === "system") {
        setResolvedTheme(mediaQuery.matches ? "dark" : "light");
      } else {
        setResolvedTheme(theme);
      }
    }

    resolveTheme();

    const listener = () => resolveTheme();
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [resolvedTheme, theme]);

  function setTheme(newTheme: Theme) {
    setThemeState(newTheme);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

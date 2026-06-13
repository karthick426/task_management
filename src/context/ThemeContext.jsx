import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("flowsync_theme") || "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("theme-dark", "theme-light", "theme-cyberpunk");
    
    if (theme === "light") {
      root.classList.add("theme-light");
    } else if (theme === "cyberpunk") {
      root.classList.add("theme-cyberpunk");
    } else {
      root.classList.add("theme-dark"); // Dark is default
    }
    
    localStorage.setItem("flowsync_theme", theme);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

import { createContext } from "react";

export const theme = {
  bg: {
    dark: "bg-gray-200",
    darkHover: "hover:bg-gray-100",
    default: "bg-gray-900",
    white: "bg-gray-50",
  },
  text: {
    dark: "text-gray-800",
    darker: "text-gray-900",
    darkest: "text-black",
    default: "text-gray-600",
    white: "text-gray-50",
  },
};

const ThemeContext = createContext(theme);
const Theme = ThemeContext.Consumer;

export const ThemeProvider = ThemeContext.Provider;

export default Theme;

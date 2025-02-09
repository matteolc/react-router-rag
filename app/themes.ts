import colors from "tailwindcss/colors";

export const themes = {
  light: {
    "color-scheme": "light" as const,
    variant: "static" as const,
    debug: false,
    preset: "tetrad" as const,
    reverse: true,
    baseColors: {
      primary: colors.purple[500],
      secondary: colors.blue[500],
      accent: colors.green[500],
    },
  },
  dark: {
    "color-scheme": "dark" as const,
    variant: "static" as const,
    debug: false,
    preset: "tetrad" as const,
    reverse: true,
    baseColors: {
      primary: colors.purple[500],
      secondary: colors.blue[500],
      accent: colors.green[500],
    },
  },
};

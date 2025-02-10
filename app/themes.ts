import {
  ThemeVariantEnum,
  type MuiThemePreset,
  type StaticThemePreset,
} from "@palettebro/theme-generator";

export const themes = {
  light: {
    "color-scheme": "light" as const,
    variant: ThemeVariantEnum.mui,
    debug: true,
    preset: "content" as MuiThemePreset,
    baseColors: {
      primary: "#9fc131",
    },
  },
  dark: {
    "color-scheme": "dark" as const,
    variant: ThemeVariantEnum.mui,
    debug: true,
    preset: "content" as MuiThemePreset,
    baseColors: {
      primary: "#9fc131",
    },
  },
};

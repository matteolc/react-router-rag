import {
	ThemeVariantEnum,
	type MuiThemePreset,
	type StaticThemePreset,
} from "@palettebro/theme-generator";

export const themes = {
	light: {
		"color-scheme": "light" as const,
		variant: ThemeVariantEnum.static,
		debug: true,
		preset: "neo-brutalist" as StaticThemePreset,
		baseColors: {
			primary: "#9fc131",
		},
	},
	dark: {
		"color-scheme": "dark" as const,
		variant: ThemeVariantEnum.static,
		debug: true,
		preset: "neo-brutalist" as StaticThemePreset,
		baseColors: {
			primary: "#9fc131",
		},
	},
};

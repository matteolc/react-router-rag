import * as cookie from "cookie";
import { useFetcher } from "react-router";
import { z } from "zod";
import { useHints } from "~/hooks/use-hints";
import { useRequestInfo } from "~/hooks/use-request-info";

export const ThemeSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
  redirectTo: z.string().optional(),
});

export const THEME_COOKIE_KEY = "_theme";

export type Theme = "light" | "dark";
export type ThemeExtended = Theme | "system";

/**
 * Returns the theme parsed from the cookie, or null if cookie is not present or invalid.
 */
export const getTheme = (request: Request): Theme | null => {
  const cookieHeader = request.headers.get("Cookie");
  const parsed = cookieHeader
    ? cookie.parse(cookieHeader)[THEME_COOKIE_KEY]
    : "light";

  if (parsed === "light" || parsed === "dark") {
    return parsed;
  }

  return null;
};

/**
 * Returns a serialized cookie string for the given theme.
 */
export const setTheme = (theme: Theme | "system"): string => {
  if (theme === "system") {
    return cookie.serialize(THEME_COOKIE_KEY, "", {
      path: "/",
      maxAge: -1,
      sameSite: "lax",
    });
  }
  return cookie.serialize(THEME_COOKIE_KEY, theme, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });
};

/**
 * Returns the user's theme preference, or the client-hint theme,
 * if the user has not set a preference.
 */
export const useTheme = (): Theme => {
  const hints = useHints();
  const requestInfo = useRequestInfo();
  const optimisticMode = useOptimisticThemeMode();
  if (optimisticMode) {
    return optimisticMode === "system" ? hints.theme : optimisticMode;
  }
  return requestInfo.userPrefs.theme ?? hints.theme;
};

/**
 * If the user's changing their theme mode preference,
 * this will return the value it's being changed to.
 */
export const useOptimisticThemeMode = ():
  | "system"
  | "light"
  | "dark"
  | undefined => {
  const themeFetcher = useFetcher({ key: "theme-fetcher" });

  if (themeFetcher?.formData) {
    const formData = Object.fromEntries(themeFetcher.formData);
    const { theme } = ThemeSchema.parse(formData);

    return theme;
  }
};

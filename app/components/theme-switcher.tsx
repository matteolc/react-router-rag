import { useEffect, useState } from "react";

import type { Theme, ThemeExtended } from "~/hooks/use-theme";
import { useOptimisticThemeMode } from "~/hooks/use-theme";

import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { MoonIcon, SunIcon, ComputerIcon } from "lucide-react";
import { useFetcher, useSubmit } from "react-router";

const THEME_ICON = {
  light: <SunIcon className="h-4 w-4" />,
  dark: <MoonIcon className="h-4 w-4" />,
  system: <ComputerIcon className="h-4 w-4" />,
};

function ThemeSwitcher({
  userPreference,
}: {
  userPreference?: Theme | null;
}) {
  const submit = useSubmit();
  const optimisticMode = useOptimisticThemeMode();
  const mode = optimisticMode ?? userPreference ?? "light";
  const [theme, setTheme] = useState<ThemeExtended>(mode);

  useEffect(() => {
    if (mode === theme) return;

    submit(
      { theme },
      {
        method: "POST",
        action: "/api/switch-theme",
        navigate: false,
        fetcherKey: "theme-fetcher",
      },
    );
  }, [mode, submit, theme]);

  return (
    <SidebarMenuItem key={theme}>
      <SidebarMenuButton asChild size="sm">
        <button
          type="button"
          onClick={() => {
            setTheme(theme === "light" ? "dark" : "light");
          }}
        >
          {THEME_ICON[theme]}
          {theme.charAt(0).toUpperCase() + theme.slice(1)}
        </button>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function ThemeSwitcherForm() {
  const fetcher = useFetcher({ key: "theme-fetcher" });
  const themes: ThemeExtended[] = ["light", "dark", "system"];

  return (
    <fetcher.Form
      method="POST"
      action="/api/switch-theme"
      className="flex gap-1"
    >
      {themes.map((theme) => (
        <button
          key={theme}
          type="submit"
          name="theme"
          value={theme}
        >
          {THEME_ICON[theme]}
          <span className="sr-only">
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </span>
        </button>
      ))}
    </fetcher.Form>
  );
}

export { ThemeSwitcher, ThemeSwitcherForm };

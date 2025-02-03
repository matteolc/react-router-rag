import { redirect } from "react-router";
import { safeRedirect } from "remix-utils/safe-redirect";

import { ThemeSchema, setTheme } from "~/hooks/use-theme";
import type { Route } from "./+types/switch-theme";

export async function action({ request }: Route.ActionArgs) {
  const formData = Object.fromEntries(await request.formData());
  const { theme, redirectTo } = ThemeSchema.parse(formData);

  const responseInit = {
    headers: { "Set-Cookie": setTheme(theme) },
  };

  if (redirectTo) {
    return redirect(safeRedirect(redirectTo), responseInit);
  }
  return new Response(null, responseInit);
}

export async function loader({ request }: Route.LoaderArgs) {
  return new Response(null);
}

import { redirect } from "react-router";
import { safeRedirect } from "remix-utils/safe-redirect";

import { WorkspaceSchema, setWorkspace } from "~/hooks/use-workspace";
import type { Route } from "./+types/switch-workspace";

export async function action({ request }: Route.ActionArgs) {
  const formData = Object.fromEntries(await request.formData());
  const { workspace, redirectTo } = WorkspaceSchema.parse(formData);

  const responseInit = {
    headers: { "Set-Cookie": setWorkspace(workspace) },
  };

  if (redirectTo) {
    return redirect(safeRedirect(redirectTo), responseInit);
  }
  return new Response(null, responseInit);
}

export async function loader({ request }: Route.LoaderArgs) {
  return new Response(null);
}

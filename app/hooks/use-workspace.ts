import * as cookie from "cookie";
import { z } from "zod";
import { useFetcher } from "react-router";
import { useRequestInfo } from "./use-request-info";
import { type Workspace, workspaces, WORKSPACES } from "~/workspaces";

export const WORKSPACE_COOKIE_KEY = "_workspace";

export const WorkspaceSchema = z.object({
  workspace: z.string(),
  redirectTo: z.string().optional(),
});

export const DEFAULT_WORKSPACE: Workspace = WORKSPACES[0];

export function getWorkspace(request: Request): Workspace {
  const cookieHeader = request.headers.get("Cookie");
  const parsed = (
    cookieHeader
      ? cookie.parse(cookieHeader)[WORKSPACE_COOKIE_KEY]
      : DEFAULT_WORKSPACE
  ) as Workspace;

  if (workspaces.some((w) => w.id === parsed)) {
    return parsed;
  }

  return workspaces[0].id;
}

export function setWorkspace(workspace: Workspace | "sales"): string {
  return cookie.serialize(WORKSPACE_COOKIE_KEY, workspace, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });
}

export function useWorkspace(): Workspace {
  const requestInfo = useRequestInfo();
  const optimisticMode = useOptimisticWorkspaceMode();
  if (optimisticMode) {
    return optimisticMode;
  }
  return requestInfo.workspace ?? workspaces[0].id;
}

export function useWorkspaceName(): string {
  const workspace = useWorkspace();
  return workspaces.find((w) => w.id === workspace)?.name ?? workspace;
}

export function useOptimisticWorkspaceMode(): Workspace | undefined {
  const workspaceFetcher = useFetcher({ key: "workspace-fetcher" });

  if (workspaceFetcher?.formData) {
    const formData = Object.fromEntries(workspaceFetcher.formData);
    const { workspace } = WorkspaceSchema.parse(formData);

    return workspace;
  }
}

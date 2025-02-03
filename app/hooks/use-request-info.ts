import type { clientHint as colorSchemeHint } from "@epic-web/client-hints/color-scheme";
import type { clientHint as timeZoneHint } from "@epic-web/client-hints/time-zone";
import type { ClientHintsValue } from "node_modules/@epic-web/client-hints/dist/utils";
import { useRouteLoaderData } from "react-router";
import type { Theme } from "./use-theme";
import type { Workspace } from "~/workspaces";

type RequestInfo = {
  hints: ClientHintsValue<{
    theme: typeof colorSchemeHint;
    timeZone: typeof timeZoneHint;
  }>;
  userPrefs: { theme: Theme | null };
  workspace: Workspace | null;
  origin: string | null;
  path: string;
};

export function useRequestInfo(): RequestInfo {
  const data = useRouteLoaderData<{ requestInfo: RequestInfo }>("root");
  if (!data?.requestInfo)
    throw new Error("No request info found in root loader.");

  return data.requestInfo;
}

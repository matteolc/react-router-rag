import { Check, ChevronsUpDown, Plus, Squirrel } from "lucide-react";
import { useEffect, useState } from "react";

import { workspaces } from "~/workspaces";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { useWorkspace } from "~/hooks/use-workspace";
import { useSubmit } from "react-router";

export function WorkspaceSwitcher() {
  const currentWorkspace = useWorkspace();
  const [workspace, setWorkspace] = useState(
    workspaces.find((ns) => ns.id === currentWorkspace) ?? workspaces[0],
  );
  const submit = useSubmit();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (workspace && currentWorkspace !== workspace.id) {
      submit(
        { workspace: workspace.id },
        {
          method: "POST",
          action: "/api/switch-workspace",
          navigate: false,
          fetcherKey: "workspace-fetcher",
        },
      );
    }
  }, [workspace, currentWorkspace]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Squirrel className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">{workspace.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg border-border"
            align="start"
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Workspaces
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {workspaces.map((ws) => (
              <DropdownMenuItem key={ws.id} onSelect={() => setWorkspace(ws)}>
                <div className="flex flex-col items-start justify-start gap-1">
                  {ws.name}{" "}
                  <span className="text-xs">{workspace.description}</span>
                </div>
                {ws.id === workspace.id && <Check className="ml-auto" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Add workspace
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

import type { LucideIcon } from "lucide-react";
import type * as React from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "~/components/ui/sidebar";
import { ThemeSwitcher } from "../theme-switcher";
import { useTheme } from "~/hooks/use-theme";
import { Link } from "react-router";

export function NavFooter({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const theme = useTheme();
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <ThemeSwitcher userPreference={theme} />
          <SidebarSeparator />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { useWorkspaceName } from "~/hooks/use-workspace";
import { NavLink, useLocation } from "react-router";
import { Fragment } from "react";
import { sentenceCase } from "~/lib/string";

export const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const currentWorkspaceName = useWorkspaceName();
  const location = useLocation();
  const pathSegments = location.pathname
    .split("/")
    .filter((segment) => segment !== "");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <NavLink
                    to="/"
                    className="transition-colors hover:text-foreground"
                  >
                    {currentWorkspaceName}
                  </NavLink>
                </BreadcrumbItem>
                {pathSegments.length > 0 && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    {pathSegments.map((segment, index) => {
                      const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
                      const isLast = index === pathSegments.length - 1;
                      return (
                        <Fragment key={href}>
                          <BreadcrumbItem className="hidden md:block">
                            {isLast ? (
                              <BreadcrumbPage>
                                {sentenceCase(segment)}
                              </BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink asChild>
                                <NavLink
                                  to={href}
                                  className="transition-colors hover:text-foreground"
                                >
                                  {sentenceCase(segment)}
                                </NavLink>
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {!isLast && (
                            <BreadcrumbSeparator className="hidden md:block" />
                          )}
                        </Fragment>
                      );
                    })}
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

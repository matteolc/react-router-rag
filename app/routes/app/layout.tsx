import { data, Outlet } from "react-router";
import { Sidebar } from "~/components/sidebar/sidebar";
import type { Route } from "./+types/layout";
import { supabaseAuth } from "~/lib/supabase-auth";
import { OnboardingDialog } from "~/components/onboarding-dialog";
import { useCustomPalette } from "@palettebro/theme-toolbar";
import { themes } from "~/themes";
import colors from "tailwindcss/colors";

export async function loader({ request }: Route.LoaderArgs) {
  const {
    headers,
    auth: { requireUser, shouldOnboard },
  } = supabaseAuth({ request });
  const { profile } = await requireUser();

  return data(
    {
      profile,
      doOnboard: shouldOnboard(profile),
    },
    { headers },
  );
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const { profile, doOnboard } = loaderData;
  useCustomPalette({
    variant: "static" as const,
    preset: "tetrad" as const,
    reverse: true,
    themes: themes,
    colors: {
      primary: colors.purple[500],
      secondary: colors.blue[500],
      accent: colors.green[500],
    },
  });
  return (
    <>
      <Sidebar>
        <div className="h-full flex-1 flex-col space-y-8 pt-8 px-8">
          <Outlet />
        </div>
      </Sidebar>
      <OnboardingDialog open={doOnboard} profile={profile} />
    </>
  );
}

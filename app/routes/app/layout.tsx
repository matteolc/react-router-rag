import { data, Outlet } from "react-router";
import { Sidebar } from "~/components/sidebar/sidebar";
import type { Route } from "./+types/layout";
import { supabaseAuth } from "~/lib/supabase-auth";
import { OnboardingDialog } from "~/components/onboarding-dialog";

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

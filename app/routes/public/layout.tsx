import { Outlet } from "react-router";
import { AlertModal } from "~/components/alert-modal";
import { ThemeSwitcherForm } from "~/components/theme-switcher";
import type { Route } from "./+types/layout";
import { supabaseAuth } from "~/lib/supabase-auth";
import { redirect } from "react-router";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { user } = await supabaseAuth({ request }).auth.getAuthUser();

  if (user) {
    return redirect("/");
  }
  return new Response(null, { status: 200 });
};

export default function Screen() {
  return (
    <>
      <AlertModal />
      <main>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 flex-col">
            <div className="w-full max-w-sm">
              <Outlet />
            </div>
            <div className="mt-4 grid justify-center text-center text-sm text-muted-foreground">
              <ThemeSwitcherForm />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

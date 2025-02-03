import { redirect } from "react-router";
import { supabaseAuth } from "~/lib/supabase-auth";
import type { Route } from "./+types/logout";

export const action = async ({ request }: Route.ActionArgs) => {
  const { headers, auth } = supabaseAuth({ request });

  await auth.signOut();
  return redirect("/", { headers });
};

export const loader = async () => {
  return redirect("/");
};

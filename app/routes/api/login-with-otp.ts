import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "react-router";
import { supabaseAuth } from "~/lib/supabase-auth";
import type { Route } from "./+types/login-with-otp";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const params = new URLSearchParams(request.url.split("?")[1]);
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType;

  if (!tokenHash) {
    return redirect("/login");
  }
  const { auth, headers } = supabaseAuth({ request });
  const { error } = await auth.verifyOtp({ tokenHash, type });
  if (error) {
    return redirect("/login");
  }

  return redirect("/", {
    headers,
  });
};

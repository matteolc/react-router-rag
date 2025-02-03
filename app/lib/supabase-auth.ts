import type { EmailOtpType, User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "~/supabase.server";
import type { Tables } from "~/db.types";
import { getDomainUrl } from "./get-domain-url";
import { redirect } from "react-router";

export type ProfileWithEmail = Pick<
  Tables<"profiles">,
  "id" | "first_name" | "last_name"
> &
  Pick<User, "email">;

export function supabaseAuth({ request }: { request: Request }) {
  const { supabase, headers } = createSupabaseServerClient(request);

  const auth = {
    signInWithOtp: async function signInWithOtp({ email }: { email: string }) {
      return await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${getDomainUrl(request)}`,
          shouldCreateUser: false,
        },
      });
    },
    signInWithPassword: async function signInWithPassword({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) {
      return await supabase.auth.signInWithPassword({ email, password });
    },
    signUp: async function signUp({
      email,
      password,
    }: { email: string; password: string }) {
      return await supabase.auth.signUp({ email, password });
    },
    getAuthUser: async function getAuthUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      return { user, error };
    },
    getProfile: async function getProfile(): Promise<{
      profile: ProfileWithEmail;
    }> {
      const { user: authUser } = await auth.getAuthUser();

      if (!authUser) {
        throw redirect("/login");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("id", authUser.id)
        .single();

      if (!profile) {
        throw redirect("/login");
      }

      return { profile: { ...profile, email: authUser.email } };
    },
    requireUser: async function requireUser() {
      const { profile } = await auth.getProfile();

      if (!profile) {
        throw redirect("/login");
      }

      return { profile };
    },
    shouldOnboard: function shouldOnboard(profile: ProfileWithEmail) {
      return !profile?.first_name || !profile?.last_name;
    },
    verifyOtp: async function verifyOtp({
      tokenHash,
      type,
    }: {
      tokenHash: string;
      type: EmailOtpType;
    }) {
      if (!tokenHash) {
        throw new Error("Token hash is required");
      }
      if (!type) {
        throw new Error("Type is required");
      }
      const {
        data: { session },
        error,
      } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

      return { session, error };
    },
    getSession: async function getSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return { session };
    },
    signOut: async function signOut() {
      await supabase.auth.signOut();
    },
    updateProfileEmail: async function updateProfileEmail(email: string) {
      const { error } = await supabase.auth.updateUser({
        email,
      });

      if (error) {
        throw new Error(error.message);
      }
    },
    updateProfile: async function updateProfile(
      profile: Partial<Tables<"profiles">>,
    ) {
      const { user: authUser } = await auth.getAuthUser();

      if (!authUser) {
        throw new Error("User not found");
      }

      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", authUser.id);

      if (error) {
        throw new Error(error.message ?? error);
      }
    },
  };

  return {
    supabase,
    headers,
    auth,
  };
}

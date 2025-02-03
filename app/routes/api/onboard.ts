import { data, redirect } from "react-router";
import { supabaseAuth } from "~/lib/supabase-auth";
import type { Route } from "./+types/onboard";
import { z } from "zod";

export async function action({ request }: Route.ActionArgs) {
  const {
    headers,
    auth: { updateProfile },
  } = supabaseAuth({ request });

  const formData = await request.formData();
  const values = Object.fromEntries(formData);
  const parsed = z
    .object({
      first_name: z.string().min(3, "First name must be at least 3 characters"),
      last_name: z.string().min(3, "Last name must be at least 3 characters"),
    })
    .safeParse(values);
  if (!parsed.success) {
    return data({ errors: parsed.error.format(), success: false });
  }

  const { first_name, last_name } = parsed.data;
  await updateProfile({
    first_name,
    last_name,
  });

  throw redirect("/", {
    headers,
  });
}

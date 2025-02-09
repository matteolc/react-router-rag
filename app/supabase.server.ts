import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import { env } from "~/env.server";
import type { Database } from "~/db.types";

const createSupabaseServerClient = (request: Request) => {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = env;

  const headers = new Headers();

  const supabase = createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options),
            );
          }
        },
      },
    },
  );

  return { supabase, headers };
};

export { createSupabaseServerClient };

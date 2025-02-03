import { z } from "zod";
import { Input } from "~/components/ui/input";
import { supabaseAuth } from "~/lib/supabase-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/cn";
import { data, Link, redirect, useFetcher } from "react-router";
import { FormError, FormFooter } from "~/components/ui/form";
import { FormControl } from "~/components/ui/form";
import { FormField } from "~/components/ui/form";
import { FormLabel } from "~/components/ui/form";
import { FormFieldset } from "~/components/ui/form";
import type { Route } from "./+types/login";
import { SubmitButton } from "~/components/ui/submit-button";
import { useFormReset } from "~/hooks/use-form-reset";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const values = Object.fromEntries(formData);
  const parsed = z
    .object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    })
    .safeParse(values);

  if (!parsed.success) {
    return data({ errors: parsed.error.format(), success: false });
  }

  const { email, password } = parsed.data;
  const { headers, auth } = supabaseAuth({ request });
  const { error } = await auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return data({ error: error.message, errors: null, success: false });
  }

  throw redirect("/", { headers });
};

export default function Screen() {
  const fetcher = useFetcher<typeof action>({ key: "login" });
  const isSubmitting = fetcher.state === "submitting";
  const formRef = useFormReset(isSubmitting);

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Sign in to your account.{" "}
            <Link
              to="/login-with-magic-link"
              className="hover:underline underline-offset-4"
            >
              Sign in with a magic link instead.
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <fetcher.Form method="POST" ref={formRef}>
            <FormFieldset>
              <FormField name="email" isRequired>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    name="email"
                    type="email"
                    autoComplete="email"
                    formNoValidate
                  />
                </FormControl>
                <FormError>{fetcher.data?.errors?.email?._errors[0]}</FormError>
              </FormField>
              <FormField name="password" isRequired>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    name="password"
                    type="password"
                    autoComplete="password"
                    formNoValidate
                  />
                </FormControl>
                <FormError>
                  {fetcher.data?.errors?.password?._errors[0]}
                </FormError>
              </FormField>
            </FormFieldset>
            <FormFooter>
              <SubmitButton
                className="w-full justify-center"
                isSubmitting={isSubmitting}
              >
                Login
              </SubmitButton>
            </FormFooter>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </fetcher.Form>
        </CardContent>
      </Card>
    </div>
  );
}

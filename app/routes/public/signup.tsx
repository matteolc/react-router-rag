import { z } from "zod";
import { Link, redirect, useFetcher } from "react-router";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/cn";
import {
  FormControl,
  FormError,
  FormField,
  FormFieldset,
  FormFooter,
  FormLabel,
} from "~/components/ui/form";
import { supabaseAuth } from "~/lib/supabase-auth";
import type { Route } from "./+types/signup";
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
    return { errors: parsed.error.format(), error: null, success: false };
  }

  const { email, password } = parsed.data;
  const { headers, auth } = supabaseAuth({ request });

  const { data, error } = await auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message, errors: null, success: false };
  }

  return redirect("/", { headers });
};

export default function Screen() {
  const fetcher = useFetcher<typeof action>({ key: "signup" });
  const isSubmitting = fetcher.state === "submitting";
  const formRef = useFormReset(isSubmitting);

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="border-border min-h-[410px]">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create a new account.{" "}
            <Link to="/login" className="hover:underline underline-offset-4">
              Already have an account? Sign in instead.
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
                    autoComplete="new-password"
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
                Create Account
              </SubmitButton>
            </FormFooter>
          </fetcher.Form>
        </CardContent>
      </Card>
    </div>
  );
}

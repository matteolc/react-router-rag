import { z } from "zod";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/cn";
import { Link, useFetcher } from "react-router";
import { FormFieldset, FormFooter } from "~/components/ui/form";
import { FormControl } from "~/components/ui/form";
import { FormLabel } from "~/components/ui/form";
import { FormError } from "~/components/ui/form";
import { FormField } from "~/components/ui/form";
import { supabaseAuth } from "~/lib/supabase-auth";
import type { Route } from "./+types/login-with-magic-link";
import { SubmitButton } from "~/components/ui/submit-button";
import { useFormReset } from "~/hooks/use-form-reset";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const values = Object.fromEntries(formData);
  const parsed = z
    .object({
      email: z.string().email("Invalid email address"),
    })
    .safeParse(values);

  if (!parsed.success) {
    return { errors: parsed.error.format(), error: null, success: false };
  }

  const { email } = parsed.data;
  const { headers, auth } = supabaseAuth({ request });
  const { error } = await auth.signInWithOtp({
    email,
  });

  if (error) {
    return { error: error.message, errors: null, success: false };
  }

  return new Response(
    JSON.stringify({ success: true, errors: null, error: null }),
    { headers },
  );
};

export default function Screen() {
  const fetcher = useFetcher<typeof action>({ key: "login-with-magic-link" });
  const isSubmitting = fetcher.state === "submitting";
  const formRef = useFormReset(isSubmitting);

  const SuccessScreen = () => (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <span className="text-lg">Link has been sent!</span>
          <p className="mb-4 mt-6">
            A magic link has been sent to your email. Click the link in the
            email to sign in. You may now close this browser window.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const LoginForm = () => (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Sign in to your account.{" "}
            <Link to="/login" className="hover:underline underline-offset-4">
              Sign in with a password instead.
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
            </FormFieldset>
            <FormFooter>
              <SubmitButton
                className="w-full justify-center"
                isSubmitting={isSubmitting}
              >
                Send magic link
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

  return fetcher.data?.success ? <SuccessScreen /> : <LoginForm />;
}

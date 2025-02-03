import { z } from "zod";
import type { Route } from "./+types/account";
import { data, redirect, useFetcher } from "react-router";
import { supabaseAuth } from "~/lib/supabase-auth";
import { HeadingWrapper, Paragraph, Subheading } from "~/components/ui/heading";
import { Heading } from "~/components/ui/heading";
import { Input } from "~/components/ui/input";
import { FormFooter } from "~/components/ui/form";
import { SubmitButton } from "~/components/ui/submit-button";
import { useFormReset } from "~/hooks/use-form-reset";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const values = Object.fromEntries(formData);
  const parsed = z
    .object({
      first_name: z.string().min(3, "First name must be at least 3 characters"),
      last_name: z.string().min(3, "Last name must be at least 3 characters"),
      email: z.string().email("Invalid email address"),
    })
    .safeParse(values);

  if (!parsed.success) {
    return data({ errors: parsed.error.format(), success: false });
  }

  const { first_name, last_name, email } = parsed.data;
  const {
    headers,
    auth: { getAuthUser, updateProfile, updateProfileEmail },
  } = supabaseAuth({ request });
  const { user } = await getAuthUser();

  await updateProfile({
    first_name,
    last_name,
  });

  const shouldUpdateUserEmail = email !== user?.email;
  if (shouldUpdateUserEmail) {
    await updateProfileEmail(email);
  }

  return new Response(
    JSON.stringify({ success: true, errors: null, error: null }),
    { headers },
  );
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const {
    auth: { getProfile },
  } = supabaseAuth({ request });
  return await getProfile();
};

export default function Screen({ loaderData }: Route.ComponentProps) {
  const { profile } = loaderData;
  const fetcher = useFetcher<typeof action>({ key: "account" });
  const isSubmitting = fetcher.state === "submitting";
  const formRef = useFormReset(isSubmitting);

  return (
    <>
      <HeadingWrapper>
        <Heading>Account</Heading>
      </HeadingWrapper>
      <fetcher.Form
        method="post"
        ref={formRef}
        className="mx-auto flex flex-1 flex-col w-full gap-y-6"
      >
        <div>
          <Subheading>Your Name</Subheading>
          <Paragraph>
            This is how you will be identified in the application.
          </Paragraph>
          <section className="mt-2 grid gap-x-8 gap-y-6 sm:grid-cols-4">
            <div>
              <Input
                aria-label="First name"
                name="first_name"
                id="first_name"
                placeholder="First name"
                autoComplete="given-name"
                defaultValue={profile.first_name ?? ""}
              />
              {fetcher.data?.errors?.first_name && (
                <p className="mt-2 text-sm text-red-600">
                  {fetcher.data?.errors.first_name._errors[0]}
                </p>
              )}
            </div>
            <div>
              <Input
                aria-label="Last name"
                name="last_name"
                id="last_name"
                placeholder="Last name"
                autoComplete="family-name"
                defaultValue={profile.last_name ?? ""}
              />
              {fetcher.data?.errors?.last_name && (
                <p className="mt-2 text-sm text-red-600">
                  {fetcher.data?.errors.last_name._errors[0]}
                </p>
              )}
            </div>
          </section>
        </div>

        <div>
          <Subheading>Email</Subheading>
          <Paragraph>
            This is how you will log in and receive important notifications.
          </Paragraph>

          <section className="mt-2 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <div>
              <Input
                type="email"
                aria-label="Email"
                name="email"
                id="email"
                defaultValue={profile.email}
              />
              {fetcher.data?.errors?.email && (
                <p className="mt-2 text-sm text-red-600">
                  {fetcher.data?.errors.email._errors[0]}
                </p>
              )}
            </div>
          </section>
        </div>

        <FormFooter className="justify-start">
          <SubmitButton isSubmitting={isSubmitting}>Save</SubmitButton>
        </FormFooter>
      </fetcher.Form>
    </>
  );
}

import { useFetcher } from "react-router";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { FormFieldset, FormFooter } from "./ui/form";
import { FormLabel } from "./ui/form";
import { FormControl } from "./ui/form";
import { FormField } from "./ui/form";
import { FormError } from "./ui/form";
import { useEffect, useRef } from "react";
import type { action } from "~/routes/api/onboard";
import type { ProfileWithEmail } from "~/lib/supabase-auth";

export function OnboardingDialog({
  open,
  profile,
}: { open: boolean; profile: ProfileWithEmail }) {
  const fetcher = useFetcher<typeof action>({ key: "onboard" });
  const isSubmitting = fetcher.state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!isSubmitting && fetcher.data?.success) {
      formRef.current?.reset();
    }
  }, [isSubmitting]);

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <button type="button" className="sr-only" aria-hidden />
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Welcome! Let's get started
          </DialogTitle>
          <DialogDescription>
            We just need a few more details to get you onboarded.
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form
          method="post"
          action="/api/onboard"
          className="space-y-4"
          ref={formRef}
        >
          <FormFieldset>
            <FormField name="first_name" isRequired>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input
                  name="first_name"
                  autoComplete="first_name"
                  defaultValue={profile.first_name ?? ""}
                  formNoValidate
                />
              </FormControl>
              <FormError>
                {fetcher.data?.errors?.first_name?._errors[0]}
              </FormError>
            </FormField>
            <FormField name="last_name" isRequired>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input
                  name="last_name"
                  autoComplete="last_name"
                  defaultValue={profile.last_name ?? ""}
                  formNoValidate
                />
              </FormControl>
              <FormError>
                {fetcher.data?.errors?.last_name?._errors[0]}
              </FormError>
            </FormField>
          </FormFieldset>
          <FormFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Completing..." : "Complete Setup"}
            </Button>
          </FormFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

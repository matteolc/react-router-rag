import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { typeFilters } from "./columns";
import type { Tables } from "~/db.types";
import { Textarea } from "~/components/ui/textarea";
import { useEffect } from "react";
import { useFetcher } from "react-router";

export function EditTargetDialog({
  target,
  open,
  onOpenChange,
}: {
  target: Tables<"uploads">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      (fetcher.data as { success?: boolean })?.success
    ) {
      onOpenChange(false);
    }
  }, [fetcher.state, fetcher.data, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Target</DialogTitle>
        </DialogHeader>
        <fetcher.Form method="PUT">
          <div className="space-y-4">
            <input type="hidden" name="id" value={target.id} />
            <div className="mt-8">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

import { Heading, HeadingWrapper } from "~/components/ui/heading";
import type { Route } from "./+types/uploads";
import { getWorkspace, useWorkspace } from "~/hooks/use-workspace";
import { supabaseAuth } from "~/lib/supabase-auth";
import type { Database, Tables } from "~/db.types";
import { data, useLoaderData, useNavigate } from "react-router";
import { getTableParams } from "~/lib/table";
import { columns } from "~/components/uploads/columns";
import { UploadsTable } from "~/components/uploads/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { DragAndDropZone } from "~/components/uploads/DragAndDropZone";
import { createClient } from "@supabase/supabase-js";

export async function loader({ request }: Route.LoaderArgs) {
  const {
    supabase,
    auth: { requireUser },
  } = supabaseAuth({ request });
  const { profile } = await requireUser();

  const { page, perPage, sort, order, filters } = await getTableParams(request);
  const workspace = getWorkspace(request);

  const query = supabase
    .from("uploads")
    .select("*", { count: "exact" })
    .eq("profile_id", profile.id)
    .eq("namespace", workspace)
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (sort && order) {
    query.order(sort as keyof Tables<"uploads">, {
      ascending: order === "asc",
    });
  }
  if (filters.length > 0) {
    for (const { id, value } of filters) {
      const column = id as keyof Tables<"uploads">;
      if (column === "name") {
        query.ilike(column, `%${value}%`);
      } else {
        query.ilike(column, `%${value}%`);
      }
    }
  }

  const { data: uploads, error, count } = await query;

  if (error) {
    return data({ error: error.message, data: [], total: 0 });
  }

  return data({
    data: (uploads as Tables<"uploads">[]) ?? [],
    total: count ?? 0,
    page,
    perPage,
    profile,
  });
}

export default function Screen() {
  const { data, total, page, perPage, profile } = useLoaderData<
    typeof loader
  >() as {
    data: Tables<"uploads">[];
    total: number;
    page: number;
    perPage: number;
    profile: Tables<"profiles">;
  };
  const navigate = useNavigate();
  const namespace = useWorkspace();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const supabase = useCallback(
    () =>
      createClient<Database>(
        process.env.SUPABASE_URL as string,
        process.env.SUPABASE_KEY as string,
      ),
    [],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const channel = supabase()
      .channel("custom-insert-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "uploads",
          filter: `profile_id=eq.${profile.id}`,
        },
        (payload) => {
          navigate("/uploads");
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [profile.id]);

  return (
    <>
      <HeadingWrapper>
        <Heading>Uploads</Heading>
        <div className="flex items-center space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent className="border-border">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  Upload Files
                </DialogTitle>
                <DialogDescription>
                  Upload files to the current workspace
                </DialogDescription>
              </DialogHeader>
              <DragAndDropZone
                namespace={namespace}
                onUploadComplete={() => {
                  setIsDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </HeadingWrapper>
      <UploadsTable
        columns={columns}
        data={data}
        totalRows={total}
        page={page}
        perPage={perPage}
      />
    </>
  );
}

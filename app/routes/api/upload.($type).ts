import { env } from "~/env.server";
import type { Route } from "./+types/upload.($type)";
import { DEFAULT_WORKSPACE } from "~/hooks/use-workspace";
import { supabaseAuth } from "~/lib/supabase-auth";
import { VectorStore } from "~/services/vector-store";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { del } from "@vercel/blob";
import { data } from "react-router";
import { pdfToVectorStore } from "~/services/pdf-to-vector-store";
import {
  createUploads,
  deleteAllUploads,
  deleteUploads,
  selectAllUploadNames,
} from "~/services/uploads";

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { type } = params;
  const searchParams = new URL(request.url).searchParams;
  const namespace = searchParams.get("namespace") || DEFAULT_WORKSPACE;

  const { auth, supabase } = supabaseAuth({ request });
  const vectorStore = new VectorStore({
    request,
  });

  switch (request.method) {
    case "POST": {
      if (type === "pdf") {
        const body = (await request.json()) as HandleUploadBody;

        try {
          return await handleUpload({
            token: env.BLOB_READ_WRITE_TOKEN,
            body,
            request,
            onBeforeGenerateToken: async (
              pathname,
              clientPayload,
              multipart,
            ) => {
              console.log("Token generation request received:", {
                pathname,
                clientPayload,
                multipart,
              });
              const { profile } = await auth.getProfile();

              const payload = clientPayload ? JSON.parse(clientPayload) : {};
              return {
                allowedContentTypes: ["application/pdf"],
                tokenPayload: JSON.stringify({
                  profileId: profile.id,
                  namespace: payload.namespace || namespace,
                }),
              };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
              console.log("Upload completed callback received:", {
                blob,
                tokenPayload,
              });
              try {
                const parsedPayload = tokenPayload
                  ? JSON.parse(tokenPayload)
                  : {};
                const uploadNamespace = parsedPayload.namespace || namespace;
                const profileId = parsedPayload.profileId;

                const { downloadUrl } = blob;
                const response = await fetch(downloadUrl);
                const fileBlob = await response.blob();
                const fileName =
                  blob.pathname.split("/").pop() || "document.pdf";
                const file = new File([fileBlob], fileName, {
                  type: "application/pdf",
                });

                const { ids, error } = await createUploads({
                  profileId,
                  namespace: uploadNamespace,
                  supabase,
                })([file], [{ url: downloadUrl }]);

                if (error) {
                  return;
                }

                await pdfToVectorStore({
                  files: [file],
                  metadata: {
                    namespace: uploadNamespace,
                    profile_id: profileId,
                    upload_id: ids[0],
                  },
                  vectorStore,
                });
                // Make this configurable
                await del(blob.url);
              } catch (error) {
                console.error(error);
              }
            },
          });
        } catch (error) {
          return data({ error: "Failed to upload PDF" }, { status: 500 });
        }
      }
      break;
    }
    case "DELETE": {
      const { profile } = await auth.getProfile();

      const formData = await request.formData();
      const intent = formData.get("intent") as string;
      const namespace = formData.get("namespace") as string;

      switch (intent) {
        default: {
          const ids = formData.getAll("ids") as string[];

          try {
            const { ids: deletedIds, error } = await deleteUploads({
              profileId: profile.id,
              namespace,
              supabase,
            })(ids);

            if (error) {
              return data({ success: false, error: error.message, ids: [] });
            }

            await vectorStore.deleteDocumentsFromVectorStore({
              uploadIds: ids,
              profileId: profile.id,
              namespace,
            });

            return data({ success: true, ids: deletedIds, error: null });
          } catch (error) {
            return data({
              success: false,
              error: (error as Error).message,
              errorTitle: "Failed to delete the documents",
            });
          }
        }
      }
    }
  }
};

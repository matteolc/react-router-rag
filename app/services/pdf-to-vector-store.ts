import type { ZodObject, ZodRawShape } from "zod";
import { PDFProcessor } from "./pdf-processor";
import type { VectorStore } from "./vector-store";

export const pdfToVectorStore = async (params: {
  files: File[];
  namespace: string;
  profileId: string;
  schema: ZodObject<ZodRawShape>;
  vectorStore: VectorStore;
}) => {
  const { files, namespace, profileId, schema, vectorStore } = params;
  const documents = await PDFProcessor.convertToStructuredDocuments({
    files,
    metadata: { namespace, profile_id: profileId },
    schema,
  });
  await vectorStore.addDocumentsToVectorStore({
    documents,
  });
};

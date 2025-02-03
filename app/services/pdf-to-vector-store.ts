import type { ZodObject, ZodRawShape } from "zod";
import { PDFProcessor } from "./pdf-processor";
import type { VectorStore } from "./vector-store";

export const pdfToVectorStore = async (params: {
  files: File[];
  metadata: Record<string, string>;
  vectorStore: VectorStore;
}) => {
  const { files, vectorStore, metadata } = params;
  const documents = await PDFProcessor.convertToStructuredDocuments({
    files,
    metadata,
  });
  await vectorStore.addDocumentsToVectorStore({
    documents,
  });
};

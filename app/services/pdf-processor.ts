import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { Document } from '@langchain/core/documents';
import type { ZodObject, ZodRawShape } from 'zod';

import { Summariser } from './summariser';

const PDFProcessor = {
  convertFileToRawDocuments: async (file: File) => {
    const loader = new PDFLoader(file, { splitPages: false });
    const rawDocuments = await loader.load();
    for (const document of rawDocuments) {
      document.pageContent = document.pageContent.replace(/\n/g, ' ');
      document.metadata = {
        ...document.metadata,
        source: file.name,
      };
    }
    return rawDocuments;
  },

  convertToRawDocuments: async (files: File[]) => {
    const rawDocumentsByFile = await Promise.all(
      files.map(async (file) => {
        return await PDFProcessor.convertFileToRawDocuments(file);
      }),
    );
    return rawDocumentsByFile.flat(1);
  },

  convertToStructuredDocuments: async ({
    files,
    metadata,
    schema,
  }: {
    files: File[];
    metadata: Record<string, string>;
    schema: ZodObject<ZodRawShape>;
  }) => {
    const rawDocuments = await PDFProcessor.convertToRawDocuments(files);
    const structuredObjects = await Promise.all(
      rawDocuments.map(async (document) => {
        return await Summariser.structure(document.pageContent, schema);
      }),
    );
    return structuredObjects.map((structuredObject, index) => {
      return new Document({
        pageContent: rawDocuments[index].pageContent.replace(
          // biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
          /[\x00-\x1F]/g,
          ' ',
        ),
        metadata: {
          ...rawDocuments[index].metadata,
          ...structuredObject,
          ...metadata,
        },
      });
    });
  },

  convertToSummarisedDocuments: async ({
    files,
    metadata,
  }: {
    files: File[];
    metadata: Record<string, string>;
  }) => {
    const rawDocuments = await PDFProcessor.convertToRawDocuments(files);
    const summaries = await Promise.all(
      rawDocuments.map(async (document) => {
        const { content: summary } = await Summariser.summarise(
          document.pageContent,
        );
        return summary;
      }),
    );
    const documents = summaries.map((summary, index) => {
      const sections = (summary as string).split('---');
      const cleanSections = sections
        .map((section) => section.replace(/\n/g, ' ').trim())
        .filter(Boolean);
      return cleanSections.map((section) => {
        return new Document({
          pageContent: section,
          metadata: {
            ...rawDocuments[index].metadata,
            ...metadata,
          },
        });
      });
    });
    return documents.flat(1);
  },
};

export { PDFProcessor };

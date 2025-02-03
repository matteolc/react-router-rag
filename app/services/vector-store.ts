import type { Document, DocumentInterface } from "@langchain/core/documents";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import type { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { createRetrievalChain } from "langchain/chains/retrieval";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { createServerClient } from "@supabase/ssr";

import { createSupabaseServerClient } from "~/supabase.server";
import type { Database } from "~/db.types";
import { ChatOpenAIClient } from "~/openai.server";
import condensePrompt from "~/prompts/condense-prompt";

const EMBEDDING_MODEL = "text-embedding-3-small";

export class VectorStore {
  private readonly vectorStore: SupabaseVectorStore;
  private readonly embeddings: OpenAIEmbeddings;
  private readonly supabase: ReturnType<typeof createServerClient<Database>>;
  private readonly llm: ChatOpenAI;

  constructor({ request }: { request: Request }) {
    const { supabase } = createSupabaseServerClient(request);
    const { llm } = new ChatOpenAIClient({});
    this.supabase = supabase;
    this.llm = llm;
    this.embeddings = new OpenAIEmbeddings({
      model: EMBEDDING_MODEL,
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.vectorStore = new SupabaseVectorStore(this.embeddings, {
      client: supabase,
      tableName: "documents",
      queryName: "match_documents",
    });
  }

  async addDocumentsToVectorStore({
    documents,
  }: {
    documents: Document[];
  }): Promise<string[]> {
    return await this.vectorStore.addDocuments(documents);
  }

  async deleteDocumentsFromVectorStore({
    uploadIds,
    profileId,
    namespace,
  }: {
    uploadIds: string[];
    profileId: string;
    namespace: string;
  }): Promise<
    PostgrestSingleResponse<
      {
        id: string;
      }[]
    >
  > {
    return await this.supabase
      .from("documents")
      .delete()
      .eq("metadata->>profile_id", profileId)
      .eq("metadata->>namespace", namespace)
      .in("metadata->>upload_id", uploadIds)
      .select("id");
  }

  async createVectorStoreRetrivalChain({
    prompt,
    filter,
    k = 100,
  }: {
    prompt: string;
    filter: Record<string, string>;
    k?: number;
  }): Promise<ReturnType<typeof createRetrievalChain>> {
    const retriever = this.vectorStore.asRetriever(k, filter);

    // Contextualize question
    const historyAwareRetriever = await createHistoryAwareRetriever({
      llm: this.llm,
      retriever,
      rephrasePrompt: ChatPromptTemplate.fromMessages([
        ["system", condensePrompt],
        new MessagesPlaceholder("chat_history"),
        ["human", "{input}"],
      ]),
    });

    // Answer question
    const questionAnswerChain = await createStuffDocumentsChain({
      llm: this.llm,
      prompt: ChatPromptTemplate.fromMessages([
        ["system", prompt],
        new MessagesPlaceholder("chat_history"),
        ["human", "{input}"],
      ]),
    });

    return await createRetrievalChain({
      retriever: historyAwareRetriever,
      combineDocsChain: questionAnswerChain,
    });
  }

  async queryVectorStore({
    query,
    filter,
    k = 100,
  }: {
    query: string;
    filter: Record<string, string>;
    k: number;
  }): Promise<DocumentInterface<Record<string, string>>[]> {
    return await this.vectorStore.similaritySearch(query, k, filter);
  }
}

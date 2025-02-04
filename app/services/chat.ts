import { AIMessage, HumanMessage } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import type { VectorStore } from "./vector-store";
import chatPrompt from "~/prompts/chat-prompt";

export const chat = async ({
  question,
  history,
  vectorStore,
  filter,
}: {
  question: string;
  history: [string, string][];
  vectorStore: VectorStore;
  filter: Record<string, string>;
}) => {
  const sanitizedQuestion = question.trim().replaceAll("\n", " ");

  const chain = await vectorStore.createVectorStoreRetrivalChain({
    prompt: chatPrompt,
    filter,
  });
  const pastMessages: BaseMessage[] = history.flatMap(
    (message: [string, string]) => [
      new HumanMessage(message[0]),
      new AIMessage(message[1]),
    ],
  );
  const { answer, context } = await chain.invoke({
    chat_history: pastMessages,
    input: sanitizedQuestion,
  });

  return { answer, question, context };
};

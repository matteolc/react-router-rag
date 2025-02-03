import { ChatOpenAI } from "@langchain/openai";
import { env } from "~/env.server";

export type ChatOpenAIModel = "gpt-4o-mini" | "gpt-4o";

export class ChatOpenAIClient {
  llm: ChatOpenAI;

  constructor({
    temperature,
    model,
  }: {
    temperature?: number;
    model?: ChatOpenAIModel;
  }) {
    this.llm = new ChatOpenAI({
      temperature: temperature ?? 0,
      model: model ?? "gpt-4o-mini",
      apiKey: env.OPENAI_API_KEY,
    });
  }
}

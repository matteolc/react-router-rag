import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAIClient } from "~/openai.server";
import summarisePrompt from "~/prompts/summarise-prompt";

const Summariser = {
  summarise: async (text: string) => {
    const { llm } = new ChatOpenAIClient({});
    return await ChatPromptTemplate.fromTemplate(summarisePrompt)
      .pipe(llm)
      .invoke({ text });
  },
};

export { Summariser };

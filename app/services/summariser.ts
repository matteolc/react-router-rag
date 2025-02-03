import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import type { ZodRawShape } from "zod";
import type { ZodObject } from "zod";
import { ChatOpenAIClient } from "~/openai.server";
import summarisePrompt from "~/prompts/summarise-prompt";

const Summariser = {
  summarise: async (text: string) => {
    const { llm } = new ChatOpenAIClient({});
    return await ChatPromptTemplate.fromTemplate(summarisePrompt)
      .pipe(llm)
      .invoke({ text });
  },

  structureChain: (schema: ZodObject<ZodRawShape>, prompt: string) => {
    const parser = StructuredOutputParser.fromZodSchema(schema);
    const { llm } = new ChatOpenAIClient({});
    const chain = RunnableSequence.from([
      ChatPromptTemplate.fromTemplate(prompt),
      llm,
      parser,
    ]);
    const formatInstructions = parser.getFormatInstructions();
    return { chain, formatInstructions };
  },

  structure: async (
    text: string,
    schema: ZodObject<ZodRawShape>,
    prompt: string,
  ) => {
    const { chain, formatInstructions } = Summariser.structureChain(
      schema,
      prompt,
    );
    return await chain.invoke({
      text,
      format_instructions: formatInstructions,
    });
  },
};

export { Summariser };

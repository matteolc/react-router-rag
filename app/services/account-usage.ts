import type { LLMResult } from "@langchain/core/outputs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/db.types";

export const getTokenUsage = ({ output }: { output: LLMResult }) => {
  const { message } = output.generations[0][0];
  const tokenUsage = message.response_metadata?.tokenUsage;
  const promptTokens = tokenUsage?.promptTokens;
  const completionTokens = tokenUsage?.completionTokens;
  const model = message.response_metadata?.model_name;
  const messageId = message.id;
  return {
    promptTokens,
    completionTokens,
    model,
    messageId,
  };
};

export const saveTokenUsage = ({
  namespace,
  profile_id,
  service,
  supabase,
}: {
  namespace: string;
  profile_id: string;
  supabase: SupabaseClient<Database>;
  service: "chat" | "summarization" | "extraction" | "other";
}) => {
  return async (output: LLMResult) => {
    try {
      const { promptTokens, completionTokens, model, messageId } =
        getTokenUsage({
          output,
        });

      await supabase.from("token_consumption").insert({
        prompt_tokens: promptTokens as number,
        completion_tokens: completionTokens as number,
        model,
        message_id: messageId as string,
        namespace,
        profile_id,
        service,
      });
    } catch (error) {
      console.error("Failed to save token usage", error);
    }
  };
};

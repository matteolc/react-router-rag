import type { LLMResult } from "@langchain/core/outputs";
import type { SupabaseClient } from "@supabase/supabase-js";

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
  supabase: SupabaseClient;
  service: "chat" | "summarization" | "extraction" | "other";
}) => {
  return async (output: LLMResult) => {
    try {
      const { promptTokens, completionTokens, model, messageId } =
        getTokenUsage({
          output,
        });

      await supabase.from("token_consumption").insert({
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        model,
        message_id: messageId,
        namespace,
        profile_id,
        service,
      });
    } catch (error) {
      console.error("Failed to save token usage", error);
    }
  };
};

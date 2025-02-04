import { VectorStore } from "~/services/vector-store";
import { supabaseAuth } from "~/lib/supabase-auth";
import { getWorkspace } from "~/hooks/use-workspace";
import type { Route } from "./+types/chat";
import { data } from "react-router";
import { chat } from "~/services/chat";

export const action = async ({ request }: Route.ActionArgs) => {
  const workspace = getWorkspace(request);

  const client = supabaseAuth({ request });
  const { profile } = await client.auth.getProfile();

  const formData = await request.formData();
  const question = formData.get("question") as string;
  const historyStr = formData.get("history") as string;
  const history = historyStr ? JSON.parse(historyStr) : [];

  const vectorStore = new VectorStore({
    request,
  });

  try {
    const { answer, context } = await chat({
      question,
      history,
      vectorStore,
      filter: { profile_id: profile.id, namespace: workspace },
    });

    return data({ answer, question, context });
  } catch (error) {
    return data({
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
      success: false,
      answer:
        "I apologise, I am unable to answer this question right now, please try again.",
      question,
    });
  }
};

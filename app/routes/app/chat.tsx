import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import type { Document } from "@langchain/core/documents";
import { type Message, MessageRole } from "~/components/chat/types";
import { ChatMessageUser } from "~/components/chat/chat-message-user";
import { ChatMessageServer } from "~/components/chat/chat-message-server";
import { useFetcherWithReset } from "~/hooks/use-fetcher-with-reset";
import { ChatEmpty } from "~/components/chat/chat-empty";
import { ChatActions } from "~/components/chat/chat-actions";
import { Button } from "~/components/ui/button";
import Contenteditable from "~/components/chat/content-editable";
import { data, useLoaderData, useSubmit } from "react-router";
import { ChatLoading } from "~/components/chat/chat-loading";
import { Progress } from "~/components/ui/progress";
import { MessageCircle, Sparkles } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/db.types";
import { supabaseAuth } from "~/lib/supabase-auth";
import type { Route } from "./+types/chat";
import { getWorkspace, useWorkspace } from "~/hooks/use-workspace";
import { formatTokens } from "~/lib/string";

export async function loader({ request }: Route.LoaderArgs) {
  const { auth, supabase } = supabaseAuth({ request });
  const { profile } = await auth.getProfile();
  const workspace = getWorkspace(request);

  const { data: tokenUsage } = await supabase
    .from("token_aggregation")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("namespace", workspace)
    .eq("service", "chat")
    .eq("time_bucket", new Date().toISOString().split("T")[0])
    .order("time_bucket", { ascending: false })
    .limit(1);

  return data({ profile, tokenUsage: tokenUsage?.[0] });
}

function TokenUsage({
  usage,
}: {
  usage: {
    promptTokens: number | undefined;
    completionTokens: number | undefined;
    model: string | undefined;
  };
}) {
  const progress =
    usage.promptTokens && usage.completionTokens
      ? ((usage.promptTokens + usage.completionTokens) / 10e6) * 100
      : 0;

  if (!usage.promptTokens || !usage.completionTokens) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border">
      <div className="flex flex-col gap-2 min-w-[200px]">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{usage.model}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center gap-1 col-span-2 text-muted-foreground">
            <MessageCircle className="h-3 w-3" />
            <span>Prompt</span>
          </div>
          <div className="text-right font-medium text-foreground">
            {formatTokens(usage.promptTokens)}
          </div>

          <div className="flex items-center gap-1 col-span-2 text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>Completion</span>
          </div>
          <div className="text-right font-medium text-foreground">
            {formatTokens(usage.completionTokens)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Screen() {
  const { profile, tokenUsage } = useLoaderData<typeof loader>();
  const [usage, setUsage] = useState({
    promptTokens: tokenUsage?.total_prompt_tokens,
    completionTokens: tokenUsage?.total_completion_tokens,
    model: tokenUsage?.model,
  });
  const workspace = useWorkspace();
  const [query, setQuery] = useState<string>("");
  const submit = useSubmit();
  const fetcher = useFetcherWithReset<{
    answer: string;
    question: string;
    context: Document[];
  }>({
    key: "chat-fetcher",
  });
  const isLoading = fetcher.state === "submitting";
  const EMPTY_MESSAGE_STATE = {
    messages: [],
    history: [],
  };
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>(EMPTY_MESSAGE_STATE);

  const { messages, pending, history } = messageState;
  const messageListRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent | React.KeyboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();

      if (!query) {
        alert("Please input a question");
        return;
      }

      const question = query.trim();

      setMessageState((state) => ({
        ...state,
        messages: [
          ...state.messages,
          {
            type: MessageRole.user,
            message: question,
          },
        ],
        pending: undefined,
      }));

      setQuery("");
      setMessageState((state) => ({ ...state, pending: "" }));
      submit(
        {
          question,
          history: JSON.stringify(history),
        },
        {
          method: "POST",
          action: "/api/chat",
          navigate: false,
          fetcherKey: "chat-fetcher",
        },
      );
    },
    [query, history, submit],
  );

  const handleEnter = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>) => {
      if (e.key === "Enter" && query) {
        handleSubmit(e);
      } else if (e.key === "Enter") {
        e.preventDefault();
      }
    },
    [query, handleSubmit],
  );

  const chatMessages = useMemo(() => {
    return [
      ...messages,
      ...(pending ? [{ type: MessageRole.system, message: pending }] : []),
    ];
  }, [messages, pending]);

  const supabase = useCallback(
    () =>
      createClient<Database>(
        process.env.SUPABASE_URL as string,
        process.env.SUPABASE_ANON_KEY as string,
      ),
    [],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const channel = supabase()
      .channel("usage-insert-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "token_aggregation",
          filter: `profile_id=eq.${profile.id}`,
        },
        (payload) => {
          if (
            payload.new.namespace === workspace &&
            payload.new.service === "chat"
          ) {
            setUsage({
              promptTokens: payload.new.total_prompt_tokens,
              completionTokens: payload.new.total_completion_tokens,
              model: payload.new.model,
            });
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "token_aggregation",
          filter: `profile_id=eq.${profile.id}`,
        },
        (payload) => {
          if (
            payload.new.namespace === workspace &&
            payload.new.service === "chat"
          ) {
            setUsage({
              promptTokens: payload.new.total_prompt_tokens,
              completionTokens: payload.new.total_completion_tokens,
              model: payload.new.model,
            });
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [profile.id]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageState.messages]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (fetcher.data) {
      const { answer: message, question, context } = fetcher.data;
      setMessageState((state) => ({
        ...state,
        messages: [
          ...state.messages,
          {
            type: MessageRole.system,
            message,
            context,
          },
        ],
        history: [...state.history, [question, message]],
      }));
      fetcher.reset();
    }
  }, [fetcher.data]);

  return (
    <div className="flex flex-col h-full">
      <TokenUsage usage={usage} key={usage.toString()} />
      <div className="hidden h-full flex-1 flex-col space-y-4 md:flex">
        {chatMessages.length > 0 && (
          <div className="flex w-full items-center justify-between border-b border-border pb-6">
            <Button
              color="secondary"
              onClick={() => setMessageState(EMPTY_MESSAGE_STATE)}
            >
              Clear Chat
            </Button>
          </div>
        )}

        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 overflow-y-auto">
            <div className="flex flex-col gap-y-6">
              {chatMessages.length === 0 && (
                <div className="flex justify-center">
                  <ChatEmpty
                    setCurrentTask={(task: string) => {
                      setQuery(task);
                    }}
                  />
                </div>
              )}
              {chatMessages.map(({ message, context, type }, index) => (
                <div key={`${type}-${message.substring(0, 20)}-${index}`}>
                  {type === MessageRole.user ? (
                    <ChatMessageUser message={message} />
                  ) : (
                    <ChatMessageServer message={message} context={context} />
                  )}
                </div>
              ))}
              {isLoading && <ChatLoading />}
              <div ref={messageListRef} className="h-16" />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0">
          <div className="flex w-full flex-col items-center rounded-xl border border-border">
            <div className="flex w-full flex-col gap-2 rounded-t-xl bg-background p-2 pt-3">
              <div className="ml-6 relative h-full w-full">
                <div className="flex min-h-[30px] w-full flex-1 cursor-text resize-none overflow-y-auto border-none text-left placeholder-primary shadow-none focus:outline-none focus:ring-0 focus:ring-transparent">
                  <Contenteditable
                    value={query}
                    onChange={setQuery}
                    onKeyDown={handleEnter}
                    className="word-break focus:expand no-scrollbar m-0 w-full resize-none whitespace-break-spaces border-0 border-transparent bg-transparent px-0 text-muted-foreground placeholder-muted-foreground focus:ring-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                  />
                </div>
              </div>
            </div>
            <ChatActions
              enabled={query?.length > 0 && !isLoading}
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

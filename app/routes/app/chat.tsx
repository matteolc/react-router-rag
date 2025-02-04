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
import { useSubmit } from "react-router";
import { ChatLoading } from "~/components/chat/chat-loading";

export default function Screen() {
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
    (
      e: React.KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>,
    ) => {
      if (e.key === "Enter" && query) {
      handleSubmit(e);
    } else if (e.key === "Enter") {
      e.preventDefault();
    }
  }, [query, handleSubmit]);

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

  const chatMessages = useMemo(() => {
    return [
      ...messages,
      ...(pending ? [{ type: MessageRole.system, message: pending }] : []),
    ];
  }, [messages, pending]);

  return (
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
                  <ChatMessageServer
                    message={message}
                    context={context}
                  />
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
          <div className="flex w-full flex-col gap-2 rounded-t-xl bg-background p-2 pt-3 border-b border-border">
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
  );
}

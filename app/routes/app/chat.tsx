import { useRef, useState, useEffect, useMemo } from "react";
import type { Document } from "@langchain/core/documents";
import { type Message, MessageRole } from "~/components/chat/types";
import { UserMessage } from "~/components/chat/UserMessage";
import { ServerMessage } from "~/components/chat/ServerMessage";
import { useFetcherWithReset } from "~/hooks/use-fetcher-with-reset";
import { EmptyChat } from "~/components/chat/EmptyChat";
import { ChatActions } from "~/components/chat/ChatActions";
import { Button } from "~/components/ui/button";
import Contenteditable from "~/components/chat/ContentEditable";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Skeleton } from "~/components/ui/skeleton";
import { useSubmit } from "react-router";
import { Bot } from "lucide-react";

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
  const [isChatPromptsModalOpen, setIsChatPromptsModalOpen] = useState(false);

  const { messages, pending, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageState.messages]);

  async function handleSubmit(
    e: React.FormEvent | React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
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
    // TODO: should use fetcher.submit?
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
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (fetcher.data) {
      const { answer: message, question, context: sourceDocs } = fetcher.data;
      setMessageState((state) => ({
        ...state,
        messages: [
          ...state.messages,
          {
            type: MessageRole.system,
            message,
            sourceDocs,
          },
        ],
        history: [...state.history, [question, message]],
      }));
      fetcher.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data]);

  const handleEnter = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>,
  ) => {
    if (e.key === "Enter" && query) {
      handleSubmit(e);
    } else if (e.key === "Enter") {
      e.preventDefault();
    }
  };

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
                <EmptyChat
                  setCurrentTask={(task: string) => {
                    setQuery(task);
                  }}
                />
              </div>
            )}
            {chatMessages.map(({ message, sourceDocs, type }, index) => {
              const messageKey = `${type}-${message.substring(0, 20)}-${index}`;
              return (
                <div key={messageKey}>
                  {type === MessageRole.user ? (
                    <UserMessage message={message} />
                  ) : (
                    <ServerMessage message={message} sourceDocs={sourceDocs} />
                  )}
                </div>
              );
            })}
            {isLoading && (
              <div className="flex w-full gap-4 rounded-lg bg-muted p-4">
                <Avatar>
                  <AvatarImage src="/avatars/02.png" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot size={24} />
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col space-y-3">
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[85%]" />
                </div>
              </div>
            )}
            <div ref={messageListRef} className="h-16" />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0">
        <div className="flex flex-col space-y-4">
          <div className="flex w-full flex-col items-center rounded-xl border border-border">
            <div className="flex w-full flex-col gap-2 rounded-t-xl bg-background p-2 pt-3 border-b border-border">
              <div className="flex items-end gap-2 md:gap-3">
                <div className="ml-6 flex min-w-0 flex-1 flex-col">
                  <div className="relative h-full w-full">
                    <div className="text-grey-800 mb-1 flex min-h-[30px] w-full flex-1 cursor-text resize-none overflow-y-auto border-none text-left placeholder-primary shadow-none focus:outline-none focus:ring-0 focus:ring-transparent md:mb-0">
                      <Contenteditable
                        value={query}
                        onChange={setQuery}
                        onKeyDown={handleEnter}
                        className="word-break focus:expand no-scrollbar m-0 w-full resize-none whitespace-break-spaces border-0 border-transparent bg-transparent px-0 text-muted-foreground placeholder-muted-foreground focus:ring-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      />
                    </div>
                  </div>
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

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Eraser, AlertCircle } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { deriveTitle, loadThreads, saveThreads, type Thread } from "@/lib/threads";
import logo from "@/assets/logo.png";

function notifyThreadChange() {
  window.dispatchEvent(new Event("chat-threads-changed"));
}

function upsertThread(id: string, messages: UIMessage[]) {
  const threads = loadThreads();
  const idx = threads.findIndex((t) => t.id === id);
  const base: Thread = {
    id,
    title: deriveTitle(messages),
    updatedAt: Date.now(),
    messages,
  };
  if (idx === -1) threads.push(base);
  else threads[idx] = { ...threads[idx], ...base };
  saveThreads(threads);
  notifyThreadChange();
}

function loadThreadMessages(id: string): UIMessage[] {
  return loadThreads().find((t) => t.id === id)?.messages ?? [];
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatWindow({ threadId }: { threadId: string }) {
  // Load persisted messages once per thread.
  const initial = useMemo(() => loadThreadMessages(threadId), [threadId]);
  const [input, setInput] = useState("");
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  const { messages, sendMessage, status, error, setMessages, stop } = useChat({
    id: threadId,
    messages: initial,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  // Persist whenever messages change (debounced via effect).
  useEffect(() => {
    if (messages.length === 0) return;
    upsertThread(threadId, messages);
  }, [messages, threadId]);

  // Keep composer focused on mount / thread change / after completion.
  useEffect(() => {
    composerRef.current?.focus();
  }, [threadId, status]);


  const handleClear = () => {
    setMessages([]);
    const threads = loadThreads().filter((t) => t.id !== threadId);
    saveThreads(threads);
    notifyThreadChange();
  };

  const isBusy = status === "submitted" || status === "streaming";

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col bg-background">
      <header className="flex items-center justify-between gap-2 border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <Bot className="size-5 text-primary" />
          <h1 className="text-sm font-semibold">Chat with modi</h1>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1.5">
            <Eraser className="size-4" />
            Clear chat
          </Button>
        )}
      </header>

      <Conversation className="flex-1 min-h-0">
        <ConversationContent className="mx-auto w-full max-w-3xl px-4 py-6">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={
                <img
                  src={logo}
                  alt=""
                  width={64}
                  height={64}
                  className="rounded-xl"
                  loading="lazy"
                />
              }
              title="How can I help today?"
              description="Ask anything — explanations, ideas, writing help, code, or casual conversation."
            />
          ) : (
            messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              const time = formatTime(new Date());
              return (
                <Message key={m.id} from={m.role}>
                  <MessageContent
                    className={
                      m.role === "user"
                        ? "bg-chat-user text-chat-user-foreground"
                        : "bg-transparent px-0 py-0"
                    }
                  >
                    {m.role === "assistant" ? (
                      <MessageResponse>{text}</MessageResponse>
                    ) : (
                      <p className="whitespace-pre-wrap">{text}</p>
                    )}
                    <div
                      className={`mt-1 text-[10px] tabular-nums ${
                        m.role === "user"
                          ? "text-chat-user-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {time}
                    </div>
                  </MessageContent>
                </Message>
              );
            })
          )}

          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent className="bg-transparent px-0 py-0">
                <Shimmer>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          )}

          {error && (
            <div className="mx-auto mt-3 flex max-w-md items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error.message || "Something went wrong. Please try again."}</span>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-chat-surface px-4 py-4">
        <div className="mx-auto w-full max-w-3xl">
          <PromptInput
            onSubmit={(_msg, e) => {
              e.preventDefault();
              const text = input.trim();
              if (!text || isBusy) return;
              sendMessage({ text });
              setInput("");
            }}
          >
            <PromptInputTextarea
              ref={composerRef}
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder="Message modi…  (Enter to send, Shift+Enter for newline)"
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit
                status={status}
                disabled={!input.trim() && !isBusy}
                onClick={(e) => {
                  if (isBusy) {
                    e.preventDefault();
                    stop();
                  }
                }}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </section>
  );
}

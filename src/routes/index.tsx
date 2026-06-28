import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ChatSidebar } from "@/components/chat-sidebar";
import { loadThreads, newThreadId, saveThreads } from "@/lib/threads";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "modi — AI Chatbot" },
      {
        name: "description",
        content:
          "Chat with modi, a friendly AI assistant. Multiple conversations, dark mode, streaming responses, all in your browser.",
      },
      { property: "og:title", content: "modi — AI Chatbot" },
      {
        property: "og:description",
        content:
          "Chat with modi, a friendly AI assistant. Multiple conversations, dark mode, streaming responses.",
      },
    ],
  }),
  component: Home,
});

function createAndOpen(navigate: ReturnType<typeof useNavigate>) {
  const id = newThreadId();
  navigate({ to: "/$threadId", params: { threadId: id } });
}

function Home() {
  const navigate = useNavigate();

  // If a thread already exists, jump to the most recent.
  useEffect(() => {
    const threads = loadThreads();
    if (threads.length > 0) {
      const latest = [...threads].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      navigate({ to: "/$threadId", params: { threadId: latest.id }, replace: true });
    }
  }, [navigate]);

  const handleDelete = (id: string) => {
    saveThreads(loadThreads().filter((t) => t.id !== id));
    window.dispatchEvent(new Event("chat-threads-changed"));
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ChatSidebar onNewChat={() => createAndOpen(navigate)} onDeleteThread={handleDelete} />
      <main className="flex flex-1 items-center justify-center bg-background p-8">
        <div className="max-w-md text-center">
          <img
            src={logo}
            alt="modi logo"
            width={96}
            height={96}
            className="mx-auto mb-6 rounded-2xl"
          />
          <h1 className="text-3xl font-semibold tracking-tight">Welcome to modi</h1>
          <p className="mt-3 text-muted-foreground">
            A modern, beginner-friendly AI chatbot. Conversations live in your browser — no
            sign-in required.
          </p>
          <Button onClick={() => createAndOpen(navigate)} size="lg" className="mt-6 gap-2">
            <MessageSquarePlus className="size-4" />
            Start a new chat
          </Button>
        </div>
      </main>
    </div>
  );
}

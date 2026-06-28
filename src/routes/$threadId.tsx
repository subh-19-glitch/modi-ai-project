import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatWindow } from "@/components/chat-window";
import { loadThreads, newThreadId, saveThreads } from "@/lib/threads";

export const Route = createFileRoute("/$threadId")({
  head: () => ({
    meta: [
      { title: "Chat — Lumen" },
      { name: "description", content: "Chatting with Lumen, your AI companion." },
    ],
  }),
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = useParams({ from: "/$threadId" });
  const navigate = useNavigate();

  const handleNewChat = () => {
    const id = newThreadId();
    navigate({ to: "/$threadId", params: { threadId: id } });
  };
  const handleDelete = (id: string) => {
    saveThreads(loadThreads().filter((t) => t.id !== id));
    window.dispatchEvent(new Event("chat-threads-changed"));
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ChatSidebar onNewChat={handleNewChat} onDeleteThread={handleDelete} />
      {/* key remounts ChatWindow per-thread so messages can't bleed across threads */}
      <ChatWindow key={threadId} threadId={threadId} />
    </div>
  );
}

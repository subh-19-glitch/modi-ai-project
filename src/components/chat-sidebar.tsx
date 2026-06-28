import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageSquarePlus, Trash2, Moon, Sun } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/components/theme-provider";
import { loadThreads, type Thread } from "@/lib/threads";

/**
 * Sidebar listing all chat threads stored in localStorage.
 * Re-reads on a custom `chat-threads-changed` window event so the active
 * chat window can notify the sidebar whenever it mutates threads.
 */
export function ChatSidebar({
  onNewChat,
  onDeleteThread,
}: {
  onNewChat: () => void;
  onDeleteThread: (id: string) => void;
}) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const { theme, toggle } = useTheme();
  const params = useParams({ strict: false }) as { threadId?: string };
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => setThreads(loadThreads().sort((a, b) => b.updatedAt - a.updatedAt));
    sync();
    window.addEventListener("chat-threads-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("chat-threads-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4 py-4">
        <img src={logo} alt="modi logo" width={32} height={32} className="rounded-md" />
        <div className="leading-tight">
          <div className="text-base font-semibold">modi</div>
          <div className="text-xs text-muted-foreground">Your AI companion</div>
        </div>
      </div>

      <div className="px-3 pb-2">
        <Button onClick={onNewChat} className="w-full justify-start gap-2">
          <MessageSquarePlus className="size-4" />
          New chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="flex flex-col gap-1 py-2">
          {threads.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              No conversations yet. Start a new chat to begin.
            </p>
          ) : (
            threads.map((t) => {
              const isActive = params.threadId === t.id;
              return (
                <div
                  key={t.id}
                  className={`group flex items-center gap-1 rounded-md px-2 transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/60"
                  }`}
                >
                  <Link
                    to="/$threadId"
                    params={{ threadId: t.id }}
                    className="flex-1 truncate py-2 text-sm"
                  >
                    {t.title}
                  </Link>
                  <button
                    type="button"
                    aria-label="Delete chat"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDeleteThread(t.id);
                      if (isActive) navigate({ to: "/" });
                    }}
                    className="rounded p-1 text-muted-foreground opacity-0 hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-3">
        <Button variant="ghost" size="sm" onClick={toggle} className="w-full justify-start gap-2">
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>
    </aside>
  );
}

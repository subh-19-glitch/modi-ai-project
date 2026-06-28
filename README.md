# modi — AI Chatbot

A modern, responsive AI chatbot built with **TanStack Start** (React + TypeScript) and the **Lovable AI Gateway**.

## Features

- Clean, responsive chat UI with light/dark mode toggle
- User & assistant message bubbles with timestamps
- Streaming responses with a "Thinking…" loading state
- Press **Enter** to send (Shift+Enter for newline)
- Auto-scroll to the latest message
- Multiple conversations with a thread sidebar (stored in your browser via `localStorage`)
- Clear / delete chat
- Graceful error handling (rate limit, credit, network)

## Running locally

```bash
bun install
bun dev
```

Open the URL printed by the dev server.

## How it works

- The browser uses `@ai-sdk/react`'s `useChat` to stream messages from `/api/chat`.
- `/api/chat` is a TanStack Start server route (`src/routes/api/chat.ts`) that calls the Lovable AI Gateway using `LOVABLE_API_KEY` (already set in your Lovable project — never exposed to the browser).
- Threads & messages persist in `localStorage` only; nothing is sent to a database.

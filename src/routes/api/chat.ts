import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

/**
 * Streaming chat endpoint. The frontend's `useChat` hook posts to this URL.
 * Returns a UI-message stream that the AI SDK consumes incrementally.
 */
export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const { messages } = (await request.json()) as { messages: UIMessage[] };

        const gateway = createLovableAiGatewayProvider(apiKey);

        try {
          const modelMessages = await convertToModelMessages(messages);
          const result = streamText({
            model: gateway("google/gemini-3-flash-preview"),
            system:
              "You are a friendly, concise AI assistant. Answer general questions naturally and helpfully. Use markdown when it improves clarity (lists, code blocks, headings).",
            messages: modelMessages,
          });

          return result.toUIMessageStreamResponse();
        } catch (err) {
          console.error("chat stream error", err);
          const status =
            err instanceof Error && /rate limit|429/i.test(err.message)
              ? 429
              : err instanceof Error && /402|credit/i.test(err.message)
                ? 402
                : 500;
          const body =
            status === 429
              ? "Rate limit reached. Please wait a moment and try again."
              : status === 402
                ? "AI credits exhausted. Please add credits to continue."
                : "Something went wrong generating a response.";
          return new Response(body, { status });
        }
      },
    },
  },
});

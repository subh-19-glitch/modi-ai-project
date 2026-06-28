import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Streaming chat endpoint. The frontend's `useChat` hook posts to this URL.
 * Returns a UI-message stream that the AI SDK consumes incrementally.
 */
export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
          return new Response("Missing GOOGLE_GENERATIVE_AI_API_KEY", { status: 500 });
        }

        const { messages } = (await request.json()) as { messages: UIMessage[] };

        // Initialize Google Provider
        const google = createGoogleGenerativeAI({ apiKey });

        try {
          const modelMessages = await convertToModelMessages(messages);
          const result = streamText({
            model: google("gemini-2.5-flash"),
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
                ? "API quota exhausted. Please check your Google AI API key."
                : "Something went wrong generating a response.";
          return new Response(body, { status });
        }
      },
    },
  },
});

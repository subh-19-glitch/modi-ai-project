import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Creates a Lovable AI Gateway provider configured with the project's API key.
 * Keep this file server-only — never import it from client/browser code.
 */
export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": apiKey,
    },
  });
}

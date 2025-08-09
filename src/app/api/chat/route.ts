import { streamText } from "ai";
import { getModel } from "@/lib/models";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const prompt: string = typeof body === "string" ? body : body.prompt ?? body.input ?? "";
  const requestedModel = typeof body === "object" ? body.model : undefined;

  const isProd = process.env.NODE_ENV === "production";
  const hasProvider = Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_BASE_URL);

  if (isProd && !hasProvider) {
    const message = `This deployment requires an AI provider. Please set OPENAI_API_KEY (or ANTHROPIC_API_KEY) or OPENAI_BASE_URL in environment variables.`;
    return new Response(message, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const model = getModel(requestedModel);

  const system = [
    "You are Clark, an elite research assistant and answer engine.",
    "Provide direct, accurate answers with clear reasoning only when necessary.",
    "Always include citations for non-trivial facts using markdown footnotes [^1] linked to URLs.",
    "Prefer primary sources. Aggregate across multiple sources when helpful.",
  ].join("\n");

  const result = streamText({
    model,
    system,
    prompt,
    temperature: 0.1,
    maxOutputTokens: 256,
    topP: 0.9,
  });

  return result.toTextStreamResponse();
} 
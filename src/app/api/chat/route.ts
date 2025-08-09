import { streamText } from "ai";
import { getModel } from "@/lib/models";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const prompt: string = typeof body === "string" ? body : body.prompt ?? body.input ?? "";
  const requestedModel = typeof body === "object" ? body.model : undefined;

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
    temperature: 0.2,
  });

  return result.toTextStreamResponse();
} 
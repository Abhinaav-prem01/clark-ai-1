import { streamText } from "ai";
import { getModel, callHuggingFaceAPI } from "@/lib/models";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const prompt: string = typeof body === "string" ? body : body.prompt ?? body.input ?? "";
  const requestedModel = typeof body === "object" ? body.model : undefined;

  const isProd = process.env.NODE_ENV === "production";
  const hasProvider = Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_BASE_URL || process.env.HUGGINGFACE_API_KEY);

  // For production without API keys, provide a helpful demo response
  if (isProd && !hasProvider) {
    const demoResponse = `I'm Clark, your AI research assistant! 🚀

This is a demo deployment. To get full AI responses, you can:

1. **Set up Hugging Face API** (FREE tier available):
   - Get your API key at https://huggingface.co/settings/tokens
   - Set HUGGINGFACE_API_KEY in Netlify environment variables
   - Models like "Qwen/Qwen2.5-4B-Instruct" work great!

2. **Set up other API keys** in Netlify environment variables:
   - OPENAI_API_KEY (for GPT models)
   - ANTHROPIC_API_KEY (for Claude models)
   - Or OPENAI_BASE_URL (for custom endpoints)

3. **Run locally** with Ollama for free:
   \`\`\`bash
   npm install -g ollama
   ollama pull mistral
   npm run dev
   \`\`\`

4. **Try the demo**: Ask me about "What is artificial intelligence?" or "Tell me about climate change"

I'm here to help with research, answer questions, and provide citations when you have the full setup! 📚`;
    
    return new Response(demoResponse, { 
      status: 200, 
      headers: { "Content-Type": "text/plain; charset=utf-8" } 
    });
  }

  try {
    const modelName = requestedModel || process.env.DEFAULT_MODEL || "hf-Qwen/Qwen2.5-4B-Instruct";
    
    // Check if this is a Hugging Face model
    if (modelName.toLowerCase().startsWith("hf-")) {
      const actualModel = modelName.replace(/^hf-/, "");
      const fullPrompt = `You are Clark, an elite research assistant and answer engine. Provide direct, accurate answers with clear reasoning only when necessary. Always include citations for non-trivial facts using markdown footnotes [^1] linked to URLs. Prefer primary sources. Aggregate across multiple sources when helpful.

User: ${prompt}
Clark:`;

      const response = await callHuggingFaceAPI(fullPrompt, actualModel);
      
      // Create a simple stream response for Hugging Face
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(response));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Use AI SDK for other providers
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
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage = `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API configuration.`;
    return new Response(errorMessage, { 
      status: 200, 
      headers: { "Content-Type": "text/plain; charset=utf-8" } 
    });
  }
} 
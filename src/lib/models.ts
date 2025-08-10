import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

// Minimal type to avoid tight coupling on internal SDK types
export type AnyModel = ReturnType<ReturnType<typeof createOpenAI>> | ReturnType<ReturnType<typeof createAnthropic>>;

// Type for model names to avoid 'any' usage
type ModelName = string;

function env(key: string): string | undefined {
  return process.env[key] && process.env[key]!.length > 0 ? process.env[key] : undefined;
}

function getOpenAI() {
  const apiKey = env("OPENAI_API_KEY");
  let baseURL = env("OPENAI_BASE_URL");

  // Auto-detect local Ollama only during development when no keys or base URL are set
  if (process.env.NODE_ENV !== "production" && !apiKey && !baseURL) {
    baseURL = "http://localhost:11434/v1";
  }

  return createOpenAI({ apiKey, baseURL });
}

function getAnthropic() {
  const apiKey = env("ANTHROPIC_API_KEY");
  return createAnthropic({ apiKey });
}

/**
 * Select an LLM by name. If `modelName` starts with "claude", Anthropic is used.
 * Otherwise an OpenAI-compatible provider is used (supports custom baseURL).
 */
export function getModel(modelName?: string): AnyModel {
  const isProd = process.env.NODE_ENV === "production";
  // Default model selection:
  // - In prod: default to a fast hosted model (gpt-4o-mini) unless explicitly set
  // - In dev without keys: fall back to a local model name for Ollama
  const defaultModel = env("DEFAULT_MODEL") || (isProd ? "gpt-4o-mini" : (env("OPENAI_API_KEY") || env("OPENAI_BASE_URL") ? "gpt-4o-mini" : "mistral"));
  const name = modelName || defaultModel;

  if (name.toLowerCase().startsWith("claude")) {
    const anthropic = getAnthropic();
    return anthropic(name as ModelName);
  }

  const openai = getOpenAI();
  const baseURL = env("OPENAI_BASE_URL");
  // Use chat compatibility when pointing to non-OpenAI endpoints (e.g., Ollama)
  if (baseURL && !baseURL.includes("api.openai.com")) {
    return openai.chat(name as ModelName);
  }
  return openai(name as ModelName);
}

/** Returns a human-friendly provider name detected from the modelName or env. */
export function getProviderName(modelName?: string): "openai" | "anthropic" {
  const name = modelName || process.env.DEFAULT_MODEL || "gpt-4o-mini";
  return name.toLowerCase().startsWith("claude") ? "anthropic" : "openai";
} 
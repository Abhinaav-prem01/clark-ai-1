# Clark – AI Research Chat (Web Search + Citations)

## Quickstart

1. Copy env file and set keys:

```bash
cp .env.local.example .env.local
# set OPENAI_API_KEY or ANTHROPIC_API_KEY
# optionally set TAVILY_API_KEY for better web search
```

2. Run the dev server:

```bash
npm run dev
```

3. Open http://localhost:3000 and start chatting.

## Features
- Provider-agnostic (OpenAI-compatible or Anthropic)
- Streaming answers with markdown and footnote citations

## Use local, free models (no API key)
You can run locally with an OpenAI-compatible server like Ollama:
- Install Ollama (`https://ollama.com`), then pull a model, e.g.:
  - `ollama pull llama3.1:8b-instruct`
- In `.env.local` set:
  - `OPENAI_BASE_URL=http://localhost:11434/v1`
  - `DEFAULT_MODEL=llama3.1:8b-instruct`
  - Leave `OPENAI_API_KEY` empty

This routes requests to your local model with no API key.

## Notes
- Without `TAVILY_API_KEY`, the app falls back to DuckDuckGo HTML for basic search results.
- You can set `OPENAI_BASE_URL` to target compatible endpoints (OpenRouter, Ollama, LM Studio).

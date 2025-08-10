# Clark – AI Research Chat (Web Search + Citations)

## Quickstart

1. Create `.env.local` file and set API keys:

```bash
# Create .env.local file with your API keys
HUGGINGFACE_API_KEY=your_hf_token_here  # FREE tier available
OPENAI_API_KEY=your_openai_key_here     # Optional
ANTHROPIC_API_KEY=your_anthropic_key    # Optional
TAVILY_API_KEY=your_tavily_key          # Optional for web search
DEFAULT_MODEL=hf-microsoft/DialoGPT-medium
```

2. Run the dev server:

```bash
npm run dev
```

3. Open http://localhost:3000 and start chatting.

## Features
- **Multi-provider support**: Hugging Face (FREE), OpenAI, Anthropic, or local Ollama
- Streaming answers with markdown and footnote citations
- Web search integration with citations

## Free AI Options

### 1. Hugging Face API (Recommended for Netlify)
- **FREE tier available** with generous limits
- Get your API key at: https://huggingface.co/settings/tokens
- Set `HUGGINGFACE_API_KEY=your_token` in environment variables
- Recommended models: `microsoft/DialoGPT-medium`, `gpt2`, `microsoft/DialoGPT-large`

### 2. Local Ollama (Development)
Run locally with free models:
- Install Ollama (`https://ollama.com`), then pull a model:
  - `ollama pull mistral`
  - `ollama pull llama3.1:8b-instruct`
- In `.env.local` set:
  - `OPENAI_BASE_URL=http://localhost:11434/v1`
  - `DEFAULT_MODEL=mistral`
  - Leave `OPENAI_API_KEY` empty

### 3. Other Providers
- **OpenAI**: Set `OPENAI_API_KEY` for GPT models
- **Anthropic**: Set `ANTHROPIC_API_KEY` for Claude models
- **OpenRouter**: Set `OPENAI_BASE_URL=https://openrouter.ai/api/v1`

## Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard:
   - `HUGGINGFACE_API_KEY=your_token` (recommended)
   - Or other API keys as needed
3. Deploy automatically on git push

## Notes
- Without `TAVILY_API_KEY`, the app falls back to DuckDuckGo HTML for basic search results
- Hugging Face models work great for chat and are completely free for reasonable usage
- The app automatically detects which provider to use based on your environment variables

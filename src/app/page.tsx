"use client";

import React from "react";
import { useCompletion } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const { completion, input, setInput, handleInputChange, handleSubmit, isLoading, stop, error } = useCompletion({ api: "/api/chat", streamProtocol: "text" });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
        <h1 className="text-xl font-semibold">Clark</h1>
        <div className="text-xs text-gray-600">AI Research Chat with Web Search + Citations</div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl w-full mx-auto">
        {!!error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 text-red-800 text-sm p-3 whitespace-pre-wrap">
            {error.message}
          </div>
        )}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-2">Answer</div>
            <div className="prose prose-sm max-w-none text-black">
              {completion ? <ReactMarkdown>{completion}</ReactMarkdown> : (
                <div className="text-gray-600 text-sm">Ask about news, research, pricing, or anything that benefits from web search. I’ll search, read, and cite.</div>
              )}
            </div>
          </div>
        </div>
      </main>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me anything…"
            className="w-full resize-none rounded-lg border border-gray-300 bg-white text-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
            rows={2}
          />
          <button
            type="submit"
            className="rounded-lg bg-black text-white px-4 py-2 text-sm disabled:opacity-50"
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
          {isLoading && (
            <button type="button" onClick={stop} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">Stop</button>
          )}
        </div>
        <div className="max-w-3xl mx-auto mt-2 text-xs text-gray-600">
          Tip: Ask for sources or say “search the web for …”.
        </div>
      </form>
    </div>
  );
}

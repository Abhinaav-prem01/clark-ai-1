import { JSDOM } from "jsdom";

export interface SearchResultItem {
  title: string;
  url: string;
  snippet?: string;
}

export interface SearchResponse {
  provider: "tavily" | "duckduckgo";
  query: string;
  results: SearchResultItem[];
}

async function searchWithTavily(query: string, maxResults: number): Promise<SearchResponse | null> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      max_results: Math.max(1, Math.min(maxResults, 10)),
      search_depth: "basic",
      include_answer: false,
      include_images: false,
    }),
  });

  if (!res.ok) throw new Error(`Tavily error ${res.status}`);
  const data = await res.json();
  const results: SearchResultItem[] = (data.results || []).map((r: any) => ({
    title: r.title,
    url: r.url,
    snippet: r.content ?? r.snippet,
  }));
  return { provider: "tavily", query, results };
}

async function searchWithDuckDuckGo(query: string, maxResults: number): Promise<SearchResponse> {
  const q = encodeURIComponent(query);
  // Use the no-JS HTML endpoint that is stable to parse server-side
  const url = `https://html.duckduckgo.com/html/?q=${q}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`DuckDuckGo error ${res.status}`);
  const html = await res.text();

  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const anchors = Array.from(doc.querySelectorAll("a.result__a"));
  const results: SearchResultItem[] = anchors.slice(0, maxResults).map((a: any) => {
    const title = a.textContent?.trim() || a.getAttribute("href") || "Untitled";
    const href = a.getAttribute("href") || "";
    // Try to find the snippet container nearby
    const parent = a.closest(".result\n, .result__body, .result__result");
    const snippet = parent?.querySelector(".result__snippet")?.textContent?.trim() || undefined;
    return { title, url: href, snippet };
  }).filter(r => r.url.startsWith("http"));

  return { provider: "duckduckgo", query, results };
}

export async function webSearch(query: string, maxResults = 5): Promise<SearchResponse> {
  const tavily = await searchWithTavily(query, maxResults).catch(() => null);
  if (tavily && tavily.results.length > 0) return tavily;
  return await searchWithDuckDuckGo(query, maxResults);
} 
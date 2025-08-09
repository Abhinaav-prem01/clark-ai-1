import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export interface ScrapedPage {
  url: string;
  title: string;
  byline?: string | null;
  excerpt?: string | null;
  textContent: string;
  length: number;
}

export async function scrapeUrl(url: string): Promise<ScrapedPage> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status})`);
  const html = await res.text();

  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;
  const reader = new Readability(doc);
  const article = reader.parse();

  const title = article?.title || doc.title || url;
  const textContent = article?.textContent?.trim() || doc.body?.textContent?.trim() || "";
  const byline = article?.byline ?? null;
  const excerpt = article?.excerpt ?? null;

  return {
    url,
    title,
    byline,
    excerpt,
    textContent,
    length: textContent.length,
  };
} 
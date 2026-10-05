import { marked } from 'marked';

export async function renderMarkdown(content: string): Promise<string> {
  return marked.parse(content, {
    async: true,
    gfm: true,
    breaks: true,
  });
}

export function estimateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

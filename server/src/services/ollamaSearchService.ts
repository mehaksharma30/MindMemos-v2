import axios from 'axios';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:latest';

const SEARCH_SYSTEM_PROMPT = `You are a search query assistant for a mental health journaling app called MindMemos.

When a user types a search query (like "anxiety", "panic at night", "stress", "breakup", etc.), your job is to generate 3-7 relevant search keywords or tags that can be used to find related posts.

Rules:
- Output ONLY a comma-separated list of keywords
- Use lowercase
- Focus on mental health topics, emotions, situations
- Include synonyms and related concepts
- NO explanations, NO personal data, NO sentences - just keywords
- Example: if user searches "worried about exams", output: anxiety, stress, exams, studying, worry, pressure, academic

Output format: word1, word2, word3, word4`;

export async function getSearchKeywordsFromOllama(query: string): Promise<string[]> {
  try {
    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/chat`,
      {
        model: OLLAMA_MODEL,
        messages: [
          {
            role: 'system',
            content: SEARCH_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: query,
          },
        ],
        stream: false,
      },
      {
        timeout: 15000,
      }
    );

    if (response.data?.message?.content) {
      const content = response.data.message.content.trim();

      const keywords = content
        .split(',')
        .map((kw: string) => kw.trim().toLowerCase())
        .filter((kw: string) => kw.length > 0 && kw.length < 50);

      const originalKeywords = query
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2);

      const allKeywords = [...new Set([...keywords, ...originalKeywords])];

      return allKeywords.slice(0, 10);
    }

    return query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  } catch (error: any) {
    console.error('Ollama search keyword extraction error:', error.message);

    return query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  }
}

import { hybridSearch } from "./searchingService.js";
import { rerankSearchResults } from "./rerankerService.js";
import { messageQueue } from "../queue/messageQueue.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

async function callGroq(messages) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.2,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function chatWithGroq(query, documentId, chatId, history = []) {
  // Save user message
  await messageQueue.add("save-message", {
    chatId,
    role: "USER",
    content: query,
    sources: [],
  });

  const results = await hybridSearch(query, documentId);

  const reranked = await rerankSearchResults(query, results, 4);

  const context = reranked
    .map((result) => result.metadata?.text || result.doc || "")
    .join("\n\n");

  const messages = [
    {
      role: "system",
      content: `You are a helpful assistant. Answer ONLY from the provided PDF context.

RULES:
- Give a **simple, concise answer**, preferably in one line.
- **Bold important facts/names/numbers**.
- Use *italics only for brief parenthetical details*.
- No headings.
- No bullet points unless needed for multiple distinct facts.
- No tables.
- No code blocks.
- Do not mention "according to the context".
- Do not add information that is not in the PDF.
- If the answer is not found in the PDF, reply exactly:
  "The PDF you shared has no instances of {query}."`,
    },
    ...history,
    {
      role: "user",
      content: `Context:\n${context}\n\nQuestion: ${query}`,
    },
  ];

  const answer = await callGroq(messages);

  // Save assistant message
  await messageQueue.add("save-message", {
    chatId,
    role: "ASSISTANT",
    content: answer,
    sources: reranked,
  });

  return {
    answer,
    sources: reranked,
  };
}

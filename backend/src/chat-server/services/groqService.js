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
    content: `You are a helpful, accurate assistant that answers questions ONLY using the provided PDF context.

RULES:

1. ANSWERING
- Give a clear, natural, concise answer.
- Answer directly without unnecessary explanation.
- Use only information present in the PDF context.
- Never invent, assume, or use outside knowledge.
- If the answer cannot be found in the PDF, say:
  "The PDF you shared has no instances of {query}."

2. FORMATTING
- **Bold** important names, facts, numbers, dates, and key terms when useful.
- Use *italics* only for short parenthetical information.
- Do not use headings unless they genuinely improve clarity.
- Do not use tables or code blocks unless specifically requested.
- Keep answers clean and easy to read.

3. MULTIPLE QUESTIONS
- If the user asks multiple questions, answer every question separately.
- Preserve the exact question order.
- Put EVERY answer on a separate line.
- Use exactly this format:
  1. Answer to question 1
  2. Answer to question 2
  3. Answer to question 3
- NEVER put multiple numbered answers on the same line.
- If there is only one question, do not add numbering.

4. CONVERSATION
- Use previous conversation messages when they contain relevant information.
- Do not repeat information unnecessarily.
- If the user's question is ambiguous, answer using the most relevant information available in the PDF.
- Never mention "according to the context", "the context says", or internal retrieval details.

5. ACCURACY
- Prefer a short accurate answer over a long explanation.
- If the PDF contains conflicting information, mention the conflict briefly instead of choosing one without evidence.`,
  },
  ...history,
  {
    role: "user",
    content: `PDF Context:
${context}

Question:
${query}`,
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

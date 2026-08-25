import "dotenv/config";
import { pineconeIndex } from "../config/pinecone.js";
import { generateQueryEmbedding } from "./embeddingService.js";

const TOP_K = 5;
const VECTOR_WEIGHT = 0.7;
const KEYWORD_WEIGHT = 0.3;

const WORD_PATTERN = /[\p{L}\p{N}]+/gu;

function tokenize(text) {
  return String(text).toLowerCase().match(WORD_PATTERN) || [];
}

function keywordScore(query, text) {
  const queryTokens = tokenize(query);
  const documentTokens = new Set(tokenize(text));

  if (!queryTokens.length) return 0;

  const matches = queryTokens.filter(token =>
    documentTokens.has(token)
  ).length;

  return matches / queryTokens.length;
}

export async function hybridSearch(query, documentId) {
  // 1. Vector search
  const queryEmbedding = await generateQueryEmbedding(query);

  const result = await pineconeIndex.query({
    vector: queryEmbedding,
    topK: TOP_K,
    includeMetadata: true,
    filter: {
      documentId: { $eq: documentId },
    },
  });

  // 2. Keyword score on vector results
  const results = result.matches.map(match => {
    const text = match.metadata?.text || "";

    const vectorScore = match.score || 0;
    const keyword = keywordScore(query, text);

    // 3. Merge scores
    const finalScore =
      vectorScore * VECTOR_WEIGHT +
      keyword * KEYWORD_WEIGHT;

    return {
      id: match.id,
      doc: text,
      metadata: match.metadata || {},
      vectorScore,
      keywordScore: keyword,
      finalScore,
    };
  });

  // 4. Sort by combined score
  return results.sort(
    (a, b) => b.finalScore - a.finalScore
  );
}
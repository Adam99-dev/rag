const WORD_PATTERN = /[\p{L}\p{N}]+/gu;

function tokenize(text) {
  return String(text).toLowerCase().match(WORD_PATTERN) || [];
}

function scoreDocument(queryTokens, document) {
  if (!queryTokens.length) return 0;

  const documentTokens = new Set(tokenize(document));
  const matches = queryTokens.filter((token) =>
    documentTokens.has(token)
  ).length;

  return matches / queryTokens.length;
}

function getDocumentText(result) {
  return result?.metadata?.text || result?.text || result?.document || result?.doc || "";
}

export async function rerankDocuments(query, documents, topN = 5) {
  try {
    const queryTokens = tokenize(query);

    return documents
      .map((document, index) => ({
        index,
        document,
        relevanceScore: scoreDocument(
          queryTokens,
          getDocumentText(document)
        ),
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, topN);
  } catch (error) {
    console.error("Error in rerankDocuments:", error);
    throw error;
  }
}

export async function rerankSearchResults(query, searchResults, topN = 5) {
  try {
    const reranked = await rerankDocuments(
      query,
      searchResults,
      topN
    );

    return reranked.map(({ index, relevanceScore }) => ({
      ...searchResults[index],
      relevanceScore,
      rerankIndex: index,
    }));
  } catch (error) {
    console.error("Error in rerankSearchResults:", error);
    throw error;
  }
}
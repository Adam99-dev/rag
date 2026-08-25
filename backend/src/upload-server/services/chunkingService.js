import { TokenTextSplitter } from "@langchain/textsplitters";

const DEFAULT_CHUNK_SIZE = 500;
const DEFAULT_CHUNK_OVERLAP = 50;

export async function splitDocuments(
  docs,
  { chunkSize = DEFAULT_CHUNK_SIZE, chunkOverlap = DEFAULT_CHUNK_OVERLAP } = {},
) {
  const splitter = new TokenTextSplitter({ chunkSize, chunkOverlap });
  const splitDocs = await splitter.splitDocuments(docs);

  return splitDocs.map(({ pageContent }) => pageContent).filter(Boolean);
}

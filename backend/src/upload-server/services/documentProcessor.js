import { downloadPDF } from "../services/downloadService.js";
import { indexToPinecone } from "../services/pineconeService.js";

export async function processDocument(documentId, fileUrl) {
  if (!fileUrl || !documentId) {
    throw new Error("fileUrl and documentId are required");
  }

  const pdfBuffer = await downloadPDF(fileUrl, documentId);

  try {
    const result = await indexToPinecone(pdfBuffer, documentId);

    console.log({
      documentId,
      indexed: result.count,
    });

    return result;
  } finally {
    pdfBuffer.fill(0);
  }
}
import { supabase } from "../config/supabase.js";
import { statusQueue } from "../queue/statusQueue.js";

export async function downloadPDF(fileUrl, documentId) {
    await statusQueue.add("status", {
    documentId,
    status: "DOWNLOADING",
  });
  const filePath = fileUrl.split("/documents/")[1];

  const { data, error } = await supabase.storage
    .from("documents")
    .download(filePath);

  if (error) throw new Error(error.message);

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

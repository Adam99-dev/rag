import {PDFParse} from "pdf-parse";

export async function loadPDF(pdfBuffer) {
  if (!Buffer.isBuffer(pdfBuffer)) {
    throw new Error("loadPDF expects a PDF Buffer");
  }

  const parser = new PDFParse({ data: pdfBuffer });
  const parsed = await parser.getText();
  await parser.destroy();

  return [
    {
      pageContent: parsed.text || "",
      metadata: {
        source: "supabase",
        pages: parsed.numpages,
      },
    },
  ];
}

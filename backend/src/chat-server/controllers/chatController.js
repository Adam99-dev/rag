import { chatWithGroq } from "../services/groqService.js";

export async function chat(req, res, next) {
  try {
    const { query, documentId, chatId, documents, history } = req.body;

    if (!query) {
      return res.status(400).json({ error: "query is required" });
    }

    return res.json(await chatWithGroq(query, documentId, chatId, history));
  } catch (error) {
    return next(error);
  }
}

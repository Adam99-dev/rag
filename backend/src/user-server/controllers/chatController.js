import { prisma } from "../config/prisma.js";

export const getChat = async (req, res) => {
  try {
    const chatId = req.params.id;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: {
        id: true,
        documentId: true,
        createdAt: true,
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    return res.status(200).json({
      message: "Chat fetched successfully",
      chat,
    });

  } catch (error) {
    console.error("Get chat error:", error);

    return res.status(500).json({
      message: "Failed to fetch chat",
    });
  }
};
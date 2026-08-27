import { prisma } from "../config/prisma.js";

export const getChat = async (req, res) => {
  try {
    const userId = req.user?.id;
    const chatId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
      select: {
        id: true,
        documentId: true,
        createdAt: true,
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            content: true,
            role: true,
            createdAt: true,
            sources: true,
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
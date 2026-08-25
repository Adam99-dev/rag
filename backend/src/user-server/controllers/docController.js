import { prisma } from "../config/prisma.js";
import { docUploadService } from "../services/docUploadService.js";
import { documentQueue } from "../queue/docQueue.js";


export const uploadDocument = async (req, res) => {
  try {
    const userId = req.user?.id;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ message: "User ID not found" });
    }

    if (!file) {
      return res.status(400).json({ message: "PDF is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        _count: {
          select: { documents: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const limit = user.plan === "PREMIUM" ? 30 : 3;

    if (user._count.documents >= limit) {
      return res.status(403).json({
        message: `Document limit reached. Your ${user.plan} plan allows ${limit} documents.`,
      });
    }

    const { fileUrl } = await docUploadService(file, userId);

    const document = await prisma.document.create({
      data: {
        userId,
        filename: file.originalname,
        fileUrl,
      },
    });

    await prisma.document.update({
      where: { id: document.id },
      data: { status: "UPLOADED" },
    });

    await documentQueue.add("process-document", {
      documentId: document.id,
      fileUrl: document.fileUrl,
    });

    return res.status(201).json({
      message: "Document uploaded successfully",
      document: {
        id: document.id,
        filename: document.filename,
        fileUrl: document.fileUrl,
        createdAt: document.createdAt,
      },
    });

  } catch (error) {
    console.error("Upload error:", error);

    if (error.message === "Only PDF files are allowed") {
      return res.status(400).json({ message: error.message });
    }

    if (
      error.message.includes("storage") ||
      error.message.includes("bucket")
    ) {
      return res.status(500).json({
        message: "Storage error",
        details: error.message,
      });
    }

    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};
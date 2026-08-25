import { prisma } from "../config/prisma.js";
import { docUploadService } from "../services/docUploadService.js";
import { documentQueue } from "../queue/docQueue.js";
import { supabase } from "../config/supabase.js";
import { pineconeIndex } from "../config/pinecone.js";


export const uploadDocument = async (req, res) => {
  try {
    const userId = req.user?.id;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
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
        status: "UPLOADED",
      },
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
        status: document.status,
        createdAt: document.createdAt,
      },
    });

  } catch (error) {
    console.error("Upload error:", error);

    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};


export const fetchAllDocuments = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const documents = await prisma.document.findMany({
      where: { userId },
      select: {
        id: true,
        filename: true,
        status: true,
        createdAt: true,
        chat: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Documents fetched successfully",
      documents,
    });

  } catch (error) {
    console.error("Fetch documents error:", error);

    return res.status(500).json({
      message: "Failed to fetch documents",
    });
  }
};



export const getDocument = async (req, res) => {
  try {
    const userId = req.user?.id;
    const documentId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
      },
      select: {
        id: true,
        filename: true,
        fileUrl: true,
        status: true,
        createdAt: true,
        chat: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    return res.status(200).json({
      message: "Document fetched successfully",
      document,
    });

  } catch (error) {
    console.error("Get document error:", error);

    return res.status(500).json({
      message: "Failed to fetch document",
    });
  }
};


export const deleteDocument = async (req, res) => {
  try {
    const userId = req.user?.id;
    const documentId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    const filePath = document.fileUrl.split("/documents/")[1];

    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([filePath]);

    if (storageError) {
      throw new Error(`Supabase delete failed: ${storageError.message}`);
    }

    await pineconeIndex.deleteMany({
      documentId: documentId,
    });

    await prisma.document.delete({
      where: {
        id: documentId,
      },
    });

    return res.status(200).json({
      message: "Document, file, chat, messages and vectors deleted successfully",
    });

  } catch (error) {
    console.error("Delete document error:", error);

    return res.status(500).json({
      message: error.message || "Failed to delete document",
    });
  }
};
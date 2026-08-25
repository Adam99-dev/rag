import { supabase } from "../config/supabase.js";

export const docUploadService = async (file, userId) => {
  if (!file) {
    throw new Error("File is required");
  }

  const fileName = `${userId}/${Date.now()}-${file.originalname}`;

  const { error } = await supabase.storage
    .from("documents")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from("documents")
    .getPublicUrl(fileName);

  return {
    fileName,
    fileUrl: data.publicUrl,
  };
};
import { supabase } from "@/lib/supabaseClient";

const BUCKET_NAME = 'avatars';

export const generateProfilePicturePath = (userId: string, file: File): string => {
  const extension = file.name.split(".").pop();
  const timestamp = Date.now();
  return `profile_pictures/${userId}-${timestamp}.${extension}`;
};

export const isValidFileType = (file: File): boolean => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  return allowedTypes.includes(file.type);
};

export const uploadProfilePicture = async (file: File, userId: string) => {
  try {
    if (!isValidFileType(file)) {
      throw new Error("Invalid file type. Only JPG, PNG, and GIF are allowed.");
    }

    const filePath = generateProfilePicturePath(userId, file);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: "3600",
        contentType: file.type,
      });

    if (error) {
      console.error("Error uploading file:", error);
      throw error;
    }

    // Get public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
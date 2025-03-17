
import { supabase } from '@/lib/supabaseClient';

export const generateProfilePicturePath = (userId: string, file: File): string => {
  const extension = file.name.split('.').pop();
  const timestamp = Date.now();
  return `profile_pictures/${userId}-${timestamp}.${extension}`;
};

export const isValidFileType = (file: File): boolean => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  return allowedTypes.includes(file.type);
};

export const uploadProfilePicture = async (file: File, userId: string) => {
  if (!isValidFileType(file)) {
    throw new Error("Invalid file type. Only JPG, PNG, and GIF are allowed.");
  }

  const filePath = generateProfilePicturePath(userId, file);

  const { data, error } = await supabase.storage
    .from("user_uploads")
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("user_uploads")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

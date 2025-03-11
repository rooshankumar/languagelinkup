
import { supabase } from '@/lib/supabaseClient';

// Get a public URL for an avatar
export const getAvatarUrl = (path: string | null): string | null => {
  if (!path) return null;
  
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(path);
    
  return data?.publicUrl || null;
};

// Upload an avatar to storage
export const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}-${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);
      
    if (error) throw error;
    
    return filePath;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return null;
  }
};

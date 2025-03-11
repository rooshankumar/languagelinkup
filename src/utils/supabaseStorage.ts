import { supabase } from '@/lib/supabaseClient';

export const uploadProfilePicture = async (file: File, filePath: string) => {
  try {
    // Upload the image to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return { url: null, error };
  }
};

export const deleteProfilePicture = async (filePath: string): Promise<void> => {
  try {
    // Extract the path from the full URL if needed
    const path = filePath.includes('avatars/') 
      ? filePath.split('avatars/')[1] 
      : filePath;
    
    const { error } = await supabase.storage
      .from('avatars')
      .remove([path]);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete profile picture');
  }
};
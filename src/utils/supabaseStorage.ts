
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export const uploadProfilePicture = async (userId: string, file: File): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;
    const filePath = `profile-pictures/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });
    
    if (uploadError) {
      throw uploadError;
    }
    
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload profile picture');
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

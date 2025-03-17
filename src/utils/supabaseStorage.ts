import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'avatars';

const ensureBucketExists = async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);

  if (!bucketExists) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 1024 * 1024 * 2 // 2MB
    });
  }
};

export const uploadProfilePicture = async (file: File, fileName: string): Promise<{ url: string | null, error: Error | null }> => {
  try {
    await ensureBucketExists();

    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { url: null, error };
  }
};

// Delete a profile picture
export const deleteProfilePicture = async (url: string): Promise<void> => {
  try {
    // Extract the file path from the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf(BUCKET_NAME) + 1).join('/');
    
    if (!filePath) {
      throw new Error('Invalid file path');
    }
    
    const { error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      throw error;
    }
  } catch (error: any) {
    console.error('deleteProfilePicture error:', error);
    throw new Error(`Error deleting profile picture: ${error.message}`);
  }
};
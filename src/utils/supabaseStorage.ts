
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Name of the bucket
const BUCKET_NAME = 'user_uploads';

// Function to ensure bucket exists
const ensureBucketExists = async () => {
  try {
    // Check if bucket exists
    const { data: buckets, error: getBucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (getBucketsError) {
      console.error('Error checking buckets:', getBucketsError);
      throw getBucketsError;
    }
    
    // If bucket doesn't exist, create it
    if (!buckets.some(bucket => bucket.name === BUCKET_NAME)) {
      const { error: createBucketError } = await supabase
        .storage
        .createBucket(BUCKET_NAME, {
          public: true,
          fileSizeLimit: 1024 * 1024 * 2 // 2MB limit
        });
      
      if (createBucketError) {
        console.error('Error creating bucket:', createBucketError);
        throw createBucketError;
      }
      
      console.log(`Bucket "${BUCKET_NAME}" created successfully`);
    }
  } catch (error) {
    console.error('ensureBucketExists error:', error);
    throw error;
  }
};

// Upload a profile picture
export const uploadProfilePicture = async (file: File, userId: string): Promise<string> => {
  try {
    await ensureBucketExists();
    
    // Create a unique file path for this user
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${uuidv4()}.${fileExt}`;
    
    // Upload the file
    const { error: uploadError } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }
    
    // Get the public URL
    const { data } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error: any) {
    console.error('uploadProfilePicture error:', error);
    throw new Error(`Error uploading profile picture: ${error.message}`);
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

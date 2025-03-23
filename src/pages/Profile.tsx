import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import UserProfileCard from "@/components/UserProfileCard";
import ProfileEdit from "@/components/ProfileEdit";
import { uploadProfilePicture } from "@/utils/fileUpload";

interface UserProfile {
  id: string;
  username: string;
  email?: string;
  native_language?: string;
  learning_language?: string;
  proficiency?: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
}

const Profile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchUserProfile = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to view your profile.",
        });
        navigate("/auth");
        return;
      }

      const userId = session.user.id;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setUserProfile(data);
    } catch (error: any) {
      console.error("Error fetching user profile:", error.message);
      toast({
        title: "Error loading profile",
        description: "Could not load your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const profileChanges = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
        },
        fetchUserProfile
      )
      .subscribe();

    return () => {
      profileChanges.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [navigate]);

  const uploadFile = async (file: File) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("User not authenticated");

    return await uploadProfilePicture(file, session.user.id);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = async (updatedProfile: UserProfile & { avatar_url?: File | string }) => {
    setIsLoading(true);
    try {
      let avatarUrl = userProfile?.avatar_url;

      if (updatedProfile.avatar_url instanceof File) {
        avatarUrl = await uploadFile(updatedProfile.avatar_url);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('users')
        .update({
          username: updatedProfile.username,
          bio: updatedProfile.bio,
          native_language: updatedProfile.native_language,
          learning_language: updatedProfile.learning_language,
          proficiency: updatedProfile.proficiency,
          location: updatedProfile.location,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id);

      if (error) throw error;

      setUserProfile({ ...updatedProfile, avatar_url: avatarUrl });
      setIsEditing(false);

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      toast({
        title: "Error updating profile",
        description: error.message || "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure proficiency is a valid value for UserProfileCard
  const getValidProficiency = (proficiency: string | undefined): "Beginner" | "Intermediate" | "Advanced" | "Fluent" => {
    if (proficiency === "Intermediate" || proficiency === "Advanced" || proficiency === "Fluent") {
      return proficiency;
    }
    return "Beginner";
  };

  const formattedUserData = userProfile
    ? {
        id: userProfile.id,
        name: userProfile.username,
        avatar: userProfile.avatar_url,
        location: userProfile.location,
        bio: userProfile.bio,
        nativeLanguage: userProfile.native_language,
        learningLanguages: userProfile.learning_language
          ? [
              {
                language: userProfile.learning_language,
                proficiency: getValidProficiency(userProfile.proficiency),
              },
            ]
          : [],
        learningGoals: "Become fluent in conversation",
        online: true,
      }
    : null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        {!isEditing && (
          <Button onClick={handleEditProfile}>Edit Profile</Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-card border rounded-lg shadow-sm p-6">
          <ProfileEdit
            userProfile={userProfile}
            onCancel={handleCancelEdit}
            onSave={handleSaveProfile}
          />
        </div>
      ) : (
        formattedUserData && <UserProfileCard user={formattedUserData} />
      )}
    </div>
  );
};

export default Profile;
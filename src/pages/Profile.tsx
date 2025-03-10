import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabaseClient"; // Import Supabase
import Button from "@/components/Button";
import { toast } from "@/hooks/use-toast";
import { LogOut, Save, Pencil, User } from "lucide-react";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch User Profile from Supabase
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error) {
        setUserData(data);
      }
    };

    fetchUserProfile();

    // ✅ Enable Real-Time Syncing
    const subscription = supabase
      .channel("realtime profile")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "user_profiles" },
        (payload) => {
          console.log("Profile updated:", payload.new);
          setUserData(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // ✅ Save Profile Updates to Supabase
  const handleSaveProfile = async () => {
    setIsLoading(true);

    try {
      const user = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_profiles")
        .update(userData)
        .eq("user_id", user.id);

      if (!error) {
        toast({ title: "Profile updated!", description: "Changes saved." });
        setIsEditing(false);
      }
    } catch (error) {
      toast({ title: "Update failed", description: "Error saving profile." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">My Profile</h1>

      {userData ? (
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <div className="flex items-center">
            <img
              src={userData.avatar || "https://ui-avatars.com/api/?name=User"}
              alt="User Avatar"
              className="w-20 h-20 rounded-full mr-4"
            />
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) =>
                    setUserData({ ...userData, name: e.target.value })
                  }
                  className="border p-2 rounded"
                />
              ) : (
                <h2 className="text-xl font-bold">{userData.name}</h2>
              )}
              <p>{userData.email}</p>
            </div>
          </div>

          <div className="mt-4">
            {isEditing ? (
              <textarea
                value={userData.bio}
                onChange={(e) =>
                  setUserData({ ...userData, bio: e.target.value })
                }
                className="border p-2 w-full rounded"
              />
            ) : (
              <p>{userData.bio || "No bio provided"}</p>
            )}
          </div>

          <div className="mt-4">
            <Button
              variant="primary"
              onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
              icon={isEditing ? <Save /> : <Pencil />}
              isLoading={isLoading}
            >
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>

            <Button variant="outline" onClick={handleLogout} icon={<LogOut />}>
              Logout
            </Button>
          </div>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default Profile;

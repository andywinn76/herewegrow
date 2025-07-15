"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AvatarUploader from "@/components/AvatarUploader";
import { toast } from "sonner";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("first_name, username, avatar_url")
          .eq("id", user.id)
          .single();

        if (!error) setProfile(profileData);
      }
    };

    getUserData();
  }, []);

  const startEditing = () => {
    setEditName(profile.first_name);
    setEditUsername(profile.username);
    setErrorMsg("");
    setIsEditing(true);
  };

  const handleProfileSave = async () => {
    setSaving(true);
    setErrorMsg("");

    const trimmedName = editName.trim();
    const trimmedUsername = editUsername.trim();

    // Check for username conflict
    const { data: existing, error: lookupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", trimmedUsername)
      .neq("id", user.id)
      .single();

    if (existing) {
      setErrorMsg("Username is already taken.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ first_name: trimmedName, username: trimmedUsername })
      .eq("id", user.id);

    if (!error) {
      setProfile({
        ...profile,
        first_name: trimmedName,
        username: trimmedUsername,
      });
      setIsEditing(false);
      setErrorMsg("");
      toast.success("Username updated!");
    } else {
      setErrorMsg("Update failed: " + error.message);
      toast.error("Failed to update Username.");
    }

    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setErrorMsg("Failed to update password: " + error.message);
      toast.error("Failed to update password.");
    } else {
      setErrorMsg("");
      toast.success("Password updated!");
      setNewPassword("");
      setShowPasswordForm(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );
    if (!confirmed) return;

    const { error } = await supabase.rpc("delete_current_user");

    if (error) {
      toast.error("Failed to delete account.");
    } else {
      setErrorMsg("");
      toast.success("Account deleted.");
      // Clear auth session so no ghost user remains
      if (!user) {
        console.error("No valid user session.");
        return;
      }
      await supabase.auth.signOut();
      window.location.href = "/"; // Or redirect to login
    }
  };

  if (!user || !profile)
    return <div className="p-6 text-center">Loading...</div>;

  const joinDate = new Date(user.created_at).toLocaleDateString();

  const uploadAvatar = async (file) => {
    if (!user) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Upload failed:", uploadError.message);
      toast.error("Avatar upload failed.");
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", user.id);

    if (!updateError) {
      setProfile((prev) => ({ ...prev, avatar_url: data.publicUrl }));
    }
  };

  return (
    <div className="mt-10 p-6 bg-white rounded-xl shadow-md space-y-6">
      <div className="flex items-center space-x-4">
        <div className="relative group">
          <div
            onClick={() => setShowUploader((prev) => !prev)}
            className="cursor-pointer"
          >
            <img
              src={
                profile.avatar_url
                  ? `${profile.avatar_url}?t=${new Date().getTime()}`
                  : `https://ui-avatars.com/api/?name=${profile.first_name}&background=random`
              }
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 group-hover:opacity-70 transition"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black bg-opacity-30 text-white text-sm rounded-full">
              Change
            </div>
          </div>
        </div>

        {showUploader && (
          <div className="mt-4">
            <AvatarUploader
              user={user}
              onUploadComplete={(newAvatarUrl) => {
                setProfile((prev) => ({ ...prev, avatar_url: newAvatarUrl }));
                setShowUploader(false);
                setErrorMsg("");
                toast.success("Profile picture updated!");
              }}
            />
          </div>
        )}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="First name"
              />
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Username"
              />
              {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleProfileSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div onClick={startEditing} className="cursor-pointer">
              <h2 className="text-xl font-semibold">{profile.first_name}</h2>
              <p className="text-sm text-gray-500">@{profile.username}</p>
            </div>
          )}
          <p className="text-xs text-blue-400">
            Hint: click your name or username above to change them.
          </p>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-400">Joined: {joinDate}</p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          {showPasswordForm ? "Cancel Password Change" : "Change Password"}
        </button>

        {showPasswordForm && (
          <div className="space-y-2">
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <button
              onClick={handlePasswordChange}
              className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Save New Password
            </button>
          </div>
        )}

        <button
          onClick={() => alert("Change Email not wired up yet")}
          className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
        >
          Change Email
        </button>

        <button
          onClick={handleDeleteAccount}
          className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import useRequireAuth from "@/hooks/useRequireAuth";
import AvatarUploader from "@/components/AvatarUploader";
import {
  handleProfileSave as saveProfile,
  handlePasswordChange as changePassword,
  handleDeleteAccount as deleteAccount,
  handleEmailChange as changeEmail,
} from "@/lib/account/profileActions";
import { toast } from "sonner";

export default function AccountPage() {
  const { user, userLoading } = useRequireAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [showUploader, setShowUploader] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("first_name, username, avatar_url")
        .eq("id", user.id)
        .single();

      if (!error) setProfile(profileData);
    };

    if (user) getProfile();
  }, [user]);

  // useEffect(() => {
  //   const syncEmailIfNeeded = async () => {
  //     if (user && profile && user.email !== profile.email) {
  //       const { error } = await supabase
  //         .from("profiles")
  //         .update({ email: user.email })
  //         .eq("id", user.id);

  //       if (error) {
  //         console.error("Failed to sync profile email:", error.message);
  //       } else {
  //         setProfile((prev) => ({ ...prev, email: user.email }));
  //         toast.success("Profile email synced.");
  //       }
  //     }
  //   };

  //   syncEmailIfNeeded();
  // }, [user, profile]);

  useEffect(() => {
  const syncEmailIfNeeded = async () => {
    const { data, error } = await supabase.auth.getUser(); // get *fresh* user
    if (error) {
      console.error("Error refreshing user session:", error.message);
      return;
    }

    const freshEmail = data.user.email;

    if (profile && profile.email !== freshEmail) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ email: freshEmail })
        .eq("id", data.user.id);

      if (updateError) {
        console.error("Failed to update profile email:", updateError.message);
        toast.error("Couldn't sync email with profile.");
      } else {
        setProfile((prev) => ({ ...prev, email: freshEmail }));
        toast.success("Email synced with profile!");
      }
    }
  };

  if (user && profile) {
    syncEmailIfNeeded();
  }
}, [user, profile]);

  const startEditing = () => {
    setEditName(profile.first_name);
    setEditUsername(profile.username);
    setErrorMsg("");
    setIsEditing(true);
  };

  const handleProfileSave = () =>
    saveProfile({
      user,
      profile,
      editName,
      editUsername,
      setSaving,
      setErrorMsg,
      setIsEditing,
      setProfile,
      toast,
    });

  const handlePasswordChange = () =>
    changePassword({
      newPassword,
      setErrorMsg,
      setNewPassword,
      setShowPasswordForm,
      toast,
    });

  const handleDeleteAccount = () => deleteAccount({ user, setErrorMsg, toast });

  const handleEmailChange = () => changeEmail({
  newEmail,
  setErrorMsg,
  setNewEmail,
  setShowEmailForm,
  toast,
});

  if (!user || !profile)
    return <div className="p-6 text-center">Loading...</div>;

  const joinDate = new Date(user.created_at).toLocaleDateString();

  if (userLoading)
    return <div className="p-6 text-center">Checking session…</div>;
  if (!user) return <div className="p-6 text-center">Redirecting…</div>;

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
          onClick={() => setShowEmailForm(!showEmailForm)}
          className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
        >
          {showEmailForm ? "Cancel Email Change" : "Change Email"}
        </button>

        {showEmailForm && (
          <div className="space-y-2">
            <input
              type="email"
              placeholder="New email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <button
              onClick={handleEmailChange}
              className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Save New Email
            </button>
          </div>
        )}

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

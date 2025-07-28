import { supabase } from "@/lib/supabaseClient";

export const handleProfileSave = async ({
  user,
  profile,
  editName,
  editUsername,
  setSaving,
  setErrorMsg,
  setIsEditing,
  setProfile,
  toast,
}) => {
  setSaving(true);
  setErrorMsg("");

  const trimmedName = editName.trim();
  const trimmedUsername = editUsername.trim();

  // Check for username conflict
  const { data: existing } = await supabase
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

export const handlePasswordChange = async ({
  newPassword,
  setErrorMsg,
  setNewPassword,
  setShowPasswordForm,
  toast,
}) => {
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

export const handleDeleteAccount = async ({ user, setErrorMsg, toast }) => {
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

export const uploadAvatar = async ({ file, user, setProfile, toast }) => {
  if (!user) return;

  const fileExt = file.name.split(".").pop();
  const filePath = `${user.id}.${fileExt}`;

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

export const handleEmailChange = async ({
  newEmail,
  setErrorMsg,
  setNewEmail,
  setShowEmailForm,
  toast,
}) => {
  const trimmedEmail = newEmail.trim();

  if (!trimmedEmail || !trimmedEmail.includes("@")) {
    setErrorMsg("Please enter a valid email address.");
    return;
  }

  const { error } = await supabase.auth.updateUser({ email: trimmedEmail });

  if (error) {
    setErrorMsg("Failed to update email: " + error.message);
    toast.error("Failed to update email.");
  } else {
    setErrorMsg("");
    toast.success("Check your inbox to confirm the email change.");
    setNewEmail("");
    setShowEmailForm(false);
  }
};


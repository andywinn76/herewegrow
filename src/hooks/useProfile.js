import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function useProfile(user) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;

    const getProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, username, avatar_url")
        .eq("id", user.id)
        .single();

      if (!error) setProfile(data);
    };

    getProfile();
  }, [user]);

  return { profile, setProfile };
}

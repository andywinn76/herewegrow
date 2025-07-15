import { toTitleCaseSmart } from "@/utils/formatting";
import { supabase } from "./supabaseClient";

export async function fetchBeds() {
  const { data, error } = await supabase
    .from("beds")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function upsertBed(name, userId) {
  const cleanedName = toTitleCaseSmart(name.trim());
  const { data, error } = await supabase
    .from("beds")
    .upsert(
      { name: cleanedName, description: "", created_by: userId },
      { onConflict: ["name", "created_by"] }
    )
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export async function updateBed(id, name) {
  const cleanedName = toTitleCaseSmart(name.trim());
  const { error } = await supabase
    .from("beds")
    .update({ name: cleanedName })
    .eq("id", id);

  if (error) throw error;
}

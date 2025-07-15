// import { supabase } from "./supabaseClient";

// export async function upsertTag(name, userId) {
//   const trimmedName = name.trim();
//   const { data, error } = await supabase
//     .from("tags")
//     .upsert(
//       {
//         name: trimmedName,
//         created_by: userId,
//       },
//       { onConflict: ["name", "created_by"] }
//     )
//     .select("id")
//     .single();

//   if (error) throw error;
//   return {data, error};
// }

import { supabase } from "./supabaseClient"; // or ../../lib/supabaseClient

export async function upsertTag(name, userId) {
  const trimmedName = name.trim();
  const { data, error } = await supabase
    .from("tags")
    .upsert(
      {
        name: trimmedName,
        created_by: userId,
      },
      { onConflict: ["name", "created_by"] }
    )
    .select("id")
    .single();

  if (error) throw error;

  return data; // return the actual tag row { id: ... }
}

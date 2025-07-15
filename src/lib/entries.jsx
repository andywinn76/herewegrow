import { upsertBed } from "./beds";
import { upsertTag } from "./tags";
import { supabase } from "./supabaseClient";

// export async function fetchEntries(user) {
//   const { data, error } = await supabase
//     .from("entries")
//     .select(
//       `
//       id,
//       bed_id,
//       entry_date,
//       title,
//       entry_type,
//       completed,
//       beds!inner(name),
//       entry_tags!inner(
//         tags!inner(name)
//       )
//     `
//     )
//     .eq("user_id", user.id) // ← add this line
//     .order("entry_date", { ascending: false });

//   if (error) throw error;

//   return data.map((e) => ({
//     id: e.id,
//     date: e.entry_date,
//     title: e.title,
//     type: e.entry_type,
//     completed: e.completed,
//     bed_id: e.bed_id,
//     bed: e.beds.name,
//     tags: e.entry_tags.map((et) => et.tags.name),
//   }));
// }

export async function fetchEntries(user) {
  const { data, error } = await supabase
    .from("entries")
    .select(
      `
      id,
      bed_id,
      entry_date,
      title,
      entry_type,
      completed,
      entry_tags!inner(
        tags!inner(name)
      )
    `
    )
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false });

  // console.log("📦 Raw fetchEntries result:", { data, error });

  if (error) throw error;

  return data.map((e) => ({
    id: e.id,
    date: e.entry_date,
    title: e.title,
    type: e.entry_type,
    completed: e.completed,
    bed_id: e.bed_id,
    // bed: e.beds.name,
    bed: null, // temporarily defer resolution
    tags: e.entry_tags.map((et) => et.tags.name),
  }));
}

export async function insertEntry({ userId, bedId, title, date, type }) {
  const { data, error } = await supabase
    .from("entries")
    .insert({
      user_id: userId,
      bed_id: bedId,
      title: title.trim(),
      body: "",
      entry_date: date,
      entry_type: type,
      completed: false,
    })
    .select("id")
    .single();

  return { data, error };
}

export async function updateEntry({
  userId,
  id,
  date,
  type,
  title,
  bedId,
  newBedName,
  tags,
}) {
  // 1. If newBedName is provided, upsert it
  let finalBedId = bedId;

  if (bedId === "__new__" && newBedName) {
    const upserted = await upsertBed(newBedName, userId);
    if (upserted?.id) {
      finalBedId = upserted.id;
    } else {
      throw new Error("Failed to upsert new bed");
    }
  }

  // 2. Upsert tags and collect their IDs
  const tagIds = [];
  for (const tag of tags) {
    if (!tag) continue;
    //OLD:
    // const tagRow = await upsertTag(tag, userId);
    // tagIds.push(tagRow.id);
    //NEW:
    const tagRow = await upsertTag(tag, userId);
    if (!tagRow?.id) {
      throw new Error(`Failed to upsert tag: "${tag}"`);
    }
    tagIds.push(tagRow.id);
  }

  // 3. Update the entry
  if (finalBedId === "") {
    finalBedId = null;
  }

  const { error: entryError } = await supabase
    .from("entries")
    .update({
      entry_date: date,
      entry_type: type,
      title: title.trim(),
      bed_id: finalBedId,
    })
    .eq("id", id);

  if (entryError) throw entryError;

  // 4. Refresh entry_tags
  const { error: deleteLinksError } = await supabase
    .from("entry_tags")
    .delete()
    .eq("entry_id", id);

  if (deleteLinksError) throw deleteLinksError;

  if (tagIds.length > 0) {
    const linkRows = tagIds.map((tagId) => ({
      entry_id: id,
      tag_id: tagId,
    }));

    const { error: insertLinksError } = await supabase
      .from("entry_tags")
      .insert(linkRows);

    if (insertLinksError) throw insertLinksError;
  }
}

export async function deleteEntry(entryId) {
  // Step 1: Delete tag links
  const { error: etError } = await supabase
    .from("entry_tags")
    .delete()
    .eq("entry_id", entryId);

  if (etError) throw etError;

  // Step 2: Delete the entry
  const { error: entryError } = await supabase
    .from("entries")
    .delete()
    .eq("id", entryId);

  if (entryError) throw entryError;
}

export async function toggleEntryCompletion(entryId, currentCompleted) {
  const { error } = await supabase
    .from("entries")
    .update({ completed: !currentCompleted })
    .eq("id", entryId);

  if (error) throw error;
}

export async function createEntry({
  userId,
  date,
  type,
  title,
  bedId,
  newBedName,
  tags,
}) {
  let finalBedId = bedId;

  // 1. Create new bed if needed
  if (bedId === "__new__" && newBedName) {
    const newBed = await upsertBed(newBedName, userId);
    if (!newBed?.id) {
      throw new Error("Failed to create new bed");
    }
    finalBedId = newBed.id;
  }

  // 2. Upsert tags
  const tagIds = [];
  for (const tag of tags) {
    if (!tag) continue;
    const trimmedTag = tag.trim();
    const tagRow = await upsertTag(trimmedTag, userId);
    if (!tagRow?.id) throw new Error(`Failed to upsert tag: "${trimmedTag}"`);
    tagIds.push(tagRow.id);
  }

  // Log some bullshit
  console.log("Inserting with:", {
    userId,
    bedId: finalBedId,
    title,
    date,
    type,
  });

  // 3. Insert the entry
  console.log("Attempting to insert entry...");
  const insertResult = await insertEntry({
    userId,
    bedId: finalBedId,
    title,
    date,
    type,
  });
  console.log("Insert result:", insertResult);

  if (!insertResult) {
    throw new Error("insertEntry returned undefined!");
  }

  const { data: newEntry, error: entryError } = insertResult;

  if (entryError) {
    throw entryError;
  }

  if (!newEntry || !newEntry.id) {
    throw new Error("No entry returned from insertEntry!");
  }
  // 4. Link tags
  for (const tagId of tagIds) {
    const { error: linkError } = await supabase
      .from("entry_tags")
      .insert({ entry_id: newEntry.id, tag_id: tagId });
    if (linkError) throw linkError;
  }
}

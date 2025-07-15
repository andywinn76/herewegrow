// src/pages/EntriesPage.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import EntryList from "./EntryList";

export default function EntriesPage() {
  const [entries, setEntries] = useState([]);

  // fetch entries + bed name + tags
  const fetchEntries = async () => {
    const { data, error } = await supabase.from("entries").select(`
        id,
        entry_date,
        title,
        body,
        beds!inner(name),
        entry_tags!inner(
          tags!inner(name)
        )
      `);

    if (error) {
      console.error("Error fetching entries:", error);
      return;
    }

    // reshape to the shape EntryList expects
    const formatted = data.map((e) => ({
      id: e.id,
      date: e.entry_date, // display in your UI as you like
      title: e.title,
      body: e.body,
      bed: e.beds.name, // from the beds join
      tags: e.entry_tags.map((et) => et.tags.name),
      // if you later add type/completed flags, you can pull them here
    }));

    setEntries(formatted);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // stubbed dispatch—you’ll wire this up to your mutation handlers
  const dispatch = (action) => {
    console.log("dispatching", action);
    // e.g. handle UPDATE_ENTRY, TOGGLE_TODO, DELETE_ENTRY, etc.
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Garden Journal</h1>
      <EntryList entries={entries} dispatch={dispatch} />
    </div>
  );
}

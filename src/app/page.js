"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/components/AuthProvider";
import Login from "@/components/Login";
import EntryForm from "@/components/EntryForm";
import EntryList from "@/components/EntryList";
import { fetchBeds } from "@/lib/beds";
import {
  createEntry,
  deleteEntry,
  fetchEntries,
  updateEntry,
  toggleEntryCompletion,
} from "@/lib/entries";
import { toast } from "sonner";

export default function App() {
  const user = useUser();

  const [loading, setLoading] = useState(true);

  const [entries, setEntries] = useState([]);
  const [beds, setBeds] = useState([]);

  useEffect(() => {
    fetchBeds()
      .then(setBeds)
      .catch((err) => console.error("Failed to fetch beds:", err));
  }, []);

  const refreshEntries = async () => {
    try {
      const data = await fetchEntries(user);
      const entriesWithBedNames = data.map((entry) => {
        const bedName =
          beds.find((bed) => bed.id === entry.bed_id)?.name ?? null;
        return {
          ...entry,
          bed: bedName,
        };
      });

      // Map bed names into entries
      // const entriesWithBedNames = data.map((entry) => {
      //   const bedName =
      //     beds.find((bed) => bed.id === entry.bed_id)?.name ?? null;
      //   return { ...entry, bed: bedName };
      // });

      setEntries(entriesWithBedNames);
    } catch (err) {
      console.error("Error refreshing entries:", err);
    }
  };

  // Once the component mounts, flip loading→false
  useEffect(() => {
    setLoading(false);
  }, []);

  // Whenever “user” changes (login or logout), re-fetch entries
  useEffect(() => {
    async function load() {
      if (!user) {
        setEntries([]);
        setLoading(false);
        return;
      }

      try {
        const data = await fetchEntries(user);
        const entriesWithBedNames = data.map((entry) => {
          const bedName =
            beds.find((bed) => bed.id === entry.bed_id)?.name ?? null;
          return { ...entry, bed: bedName };
        });
        setEntries(entriesWithBedNames);
      } catch (err) {
        console.error("Error refreshing entries:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user, beds]);

  // Show “Loading…” until our initial useEffect flips loading=false
  if (loading) {
    return <p className="p-4">Loading…</p>;
  }

  // If no logged‐in user, show the Login form
  if (!user) {
    return <Login />;
  }

  // Toggle “completed” on an existing entry
  const handleToggle = async (entryId) => {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    try {
      await toggleEntryCompletion(entryId, entry.completed);
      await refreshEntries();
    } catch (err) {
      console.error("Error toggling completion:", err);
    }
  };

  // Delete an entry (and its entry_tags children)
  const handleDelete = async (entryId) => {
    try {
      await deleteEntry(entryId);
      await refreshEntries();
      toast.success("Entry deleted.");
    } catch (err) {
      console.error("Error deleting entry:", err);
      toast.error("Couldn't delete entry.");
    }
  };

  // Update an existing entry
  const handleUpdate = async (props) => {
    try {
      await updateEntry({ ...props, userId: user.id });
      const updatedBeds = await fetchBeds();
      setBeds(updatedBeds);
      await refreshEntries();
      toast.success("Entry updated!");
    } catch (err) {
      console.error("Error updating entry:", err);
      toast.error("Couldn't update entry.");
    }
  };

  // Add an entry
  const handleAdd = async ({ date, type, title, bedId, newBedName, tags }) => {
    try {
      await createEntry({
        userId: user.id,
        date,
        type,
        title,
        bedId,
        newBedName,
        tags,
      });

      await refreshEntries();
      await fetchBeds();
      toast.success("Entry added!");
    } catch (err) {
      console.error("Error creating new entry:", err);
      toast.error("Couldn't add entry.");
    }
  };

  return (
    <div className="p-2">
      <EntryForm beds={beds} onAdd={handleAdd} />

      <EntryList
        entries={entries}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        beds={beds}
      />
    </div>
  );
}

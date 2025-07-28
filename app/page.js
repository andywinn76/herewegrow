"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EntryForm from "@/components/EntryForm";
import EntryList from "@/components/EntryList";
import { fetchBeds } from "@/lib/beds";
import useRequireAuth from "@/hooks/useRequireAuth";
import {
  fetchEntries,
  createEntry,
  deleteEntry,
  updateEntry,
  toggleEntryCompletion,
} from "@/lib/entries";
import { toast } from "sonner";

export default function AppPage() {
  const { user, userLoading } = useRequireAuth();
  const router = useRouter();

  const [entries, setEntries] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated (only after userLoading finishes)
  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  // Fetch beds when component mounts
  useEffect(() => {
    if (user && !userLoading) {
      fetchBeds()
        .then(setBeds)
        .catch((err) => console.error("Failed to fetch beds:", err));
    }
  }, [user, userLoading]);

  // Fetch entries when user and beds are available
  useEffect(() => {
    if (!user) return;

    const loadEntries = async () => {
      try {
        const data = await fetchEntries(user);
        const entriesWithBedNames = data.map((entry) => {
          const bedName =
            beds.find((bed) => bed.id === entry.bed_id)?.name ?? null;
          return { ...entry, bed: bedName };
        });
        setEntries(entriesWithBedNames);
      } catch (err) {
        console.error("Error fetching entries:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, [user, beds]);

  // Show loading spinner until auth + data is ready
  if (userLoading || loading) {
    return <p className="p-4">Loading…</p>;
  }

  // Still not logged in? Don’t render anything (router push already triggered above)
  if (!user) return <p>Redirecting...</p>;

  const refreshEntries = async () => {
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
    }
  };

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
      const updatedBeds = await fetchBeds();
      setBeds(updatedBeds);
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

"use client";

import useRequireAuth from "@/hooks/useRequireAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchBeds, upsertBed, updateBed } from "@/lib/beds";

import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function SetupPage() {
  const { user, userLoading } = useRequireAuth();
  const router = useRouter();

  const [beds, setBeds] = useState([]);
  const [newBed, setNewBed] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingBedId, setEditingBedId] = useState(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    if (user && !userLoading) {
      loadBeds();
    }
  }, [user, userLoading]);

  async function loadBeds() {
    try {
      const data = await fetchBeds();
      setBeds(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load beds.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddBed(e) {
    e.preventDefault();
    if (!newBed.trim()) return;

    try {
      await upsertBed(newBed, user.id);
      toast.success("Bed added!");
      setNewBed("");
      await loadBeds();
    } catch (err) {
      console.error(err);
      toast.error("Error adding bed.");
    }
  }

  async function handleDeleteBed(id, name) {
    const confirmed = window.confirm(
      `Delete "${name}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      // Step 1: Update all entries to remove the reference
      const { error: updateError } = await supabase
        .from("entries")
        .update({ bed_id: null })
        .eq("bed_id", id);

      if (updateError) throw updateError;

      // Step 2: Delete the bed itself
      const { error: deleteError } = await supabase
        .from("beds")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      toast.success(`Deleted "${name}" and updated affected entries.`);
      await loadBeds();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete bed.");
    }
  }

  if (userLoading) return <p>Checking session...</p>;
  if (!user) return <p>Redirecting...</p>;

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Setup Your Garden Beds</h1>

      <form onSubmit={handleAddBed} className="flex gap-2 mb-8">
        <input
          type="text"
          value={newBed}
          onChange={(e) => setNewBed(e.target.value)}
          placeholder="Enter bed name"
          className="flex-1 border border-gray-300 rounded px-4 py-2"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Bed
        </button>
      </form>

      {loading ? (
        <p>Loading beds...</p>
      ) : beds.length === 0 ? (
        <p className="text-gray-500">No beds yet. Add one above!</p>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-1">Your beds</h2>
          <p className="text-small text-blue-400 mb-4">
            Click on a bed name to update it.
          </p>
          <div className="flex flex-wrap gap-2">
            {beds.map((bed) => (
              <div
                key={bed.id}
                className="inline-flex items-center px-2 py-1 bg-gray-100 border border-gray-300 rounded-full text-sm cursor-pointer"
                onClick={() => {
                  setEditingBedId(bed.id);
                  setEditingName(bed.name);
                }}
              >
                {editingBedId === bed.id ? (
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={async () => {
                      try {
                        if (editingName.trim() && editingName !== bed.name) {
                          await updateBed(bed.id, editingName);
                          await loadBeds();
                          toast.success("Bed name updated!");
                        }
                      } catch (err) {
                        console.error(err);
                        toast.error("Failed to update bed.");
                      } finally {
                        setEditingBedId(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.target.blur();
                      if (e.key === "Escape") setEditingBedId(null);
                    }}
                    className="text-sm px-2 py-0.5 border rounded bg-white"
                  />
                ) : (
                  <>
                    <span className="mr-2">{bed.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBed(bed.id, bed.name);
                      }}
                      className="text-gray-500 hover:text-red-600 font-bold ml-1"
                      aria-label={`Delete ${bed.name}`}
                    >
                      &times;
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

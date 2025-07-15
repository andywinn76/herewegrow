"use client";
import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { MdOutlineCancel } from "react-icons/md";
import { FaRegSave } from "react-icons/fa";
import { RiArrowGoBackLine } from "react-icons/ri";

export default function EntryList({
  entries,
  onDelete,
  onToggle,
  onUpdate,
  beds,
}) {
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" | "notes" | "next7"
  const [tagSearch, setTagSearch] = useState("");
  const [bedFilter, setBedFilter] = useState("");
  const [bedSelectionMode, setBedSelectionMode] = useState("existing"); // "existing" or "new"

  const today = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);

  const filteredEntries = entries.filter((entry) => {
    const matchesType =
      filter === "all" ||
      (filter === "notes" && entry.type === "note") ||
      (filter === "next7" &&
        entry.type === "todo" &&
        !entry.completed &&
        new Date(entry.date) >= today &&
        new Date(entry.date) <= sevenDaysFromNow);

    const matchesTag =
      tagSearch === "" ||
      entry.tags?.some((tag) =>
        tag.toLowerCase().includes(tagSearch.toLowerCase())
      );

    const matchesBed =
      bedFilter === "" || (entry.bed ?? "No bed assigned") === bedFilter;

    return matchesType && matchesTag && matchesBed;
  });

  return (
    <div className="space-y-4 mt-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded ${
            filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("notes")}
          className={`px-3 py-1 rounded ${
            filter === "notes" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Notes Only
        </button>
        <button
          onClick={() => setFilter("next7")}
          className={`px-3 py-1 rounded ${
            filter === "next7" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          To-dos This Week
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by tag..."
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/2"
        />
        <select
          value={bedFilter}
          onChange={(e) => setBedFilter(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/2"
        >
          <option value="">All beds</option>
          {[...new Set(entries.map((e) => e.bed ?? "No bed assigned"))]
            .sort((a, b) => {
              if (a === "No bed assigned") return 1;
              if (b === "No bed assigned") return -1;
              return a.localeCompare(b);
            })
            .map((bed) => (
              <option key={bed} value={bed}>
                {bed}
              </option>
            ))}
        </select>
      </div>
      {filteredEntries.length === 0 && (
        <p className="text-gray-700 italic text-xl">No entries to show.</p>
      )}

      {filteredEntries.map((entry) => (
        <div
          key={entry.id}
          className={`p-4 rounded shadow transition-colors ${
            entry.type === "todo" && entry.completed
              ? "bg-green-100 text-green-800"
              : "bg-gray-100"
          }`}
        >
          {editingId === entry.id ? (
            // ─── EDIT MODE ─────────────────────────────────────────
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                // Gather updated values from the form:
                const updatedDate = e.target.date.value; // YYYY-MM-DD
                const updatedType = e.target.type.value; // “note” or “todo”
                const updatedTitle = e.target.title.value;
                const updatedBedRaw = e.target.bedId.value;
                if (updatedBedRaw === "__none__") {
                  alert("Please select a bed.");
                  return;
                }

                const updatedBed =
                  updatedBedRaw === "__new__"
                    ? "__new__"
                    : parseInt(updatedBedRaw, 10);

                const newBedName = e.target.newBedName?.value?.trim() || null;
                const updatedTags = e.target.tags.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter((t) => t.length > 0);

                // Call the onUpdate prop with everything
                await onUpdate({
                  id: entry.id,
                  date: updatedDate,
                  type: updatedType,
                  title: updatedTitle,
                  bedId: updatedBed,
                  newBedName,
                  tags: updatedTags,
                });

                setEditingId(null);
              }}
              className="space-y-2"
            >
              {/* Date */}
              <input
                type="date"
                name="date"
                defaultValue={entry.date}
                className="w-full p-1 border rounded"
                required
              />

              {/* Type dropdown */}
              <select
                name="type"
                defaultValue={entry.type}
                className="w-full p-1 border rounded"
              >
                <option value="note">Note</option>
                <option value="todo">To-do</option>
              </select>

              {/* Title */}
              <input
                name="title"
                defaultValue={entry.title}
                className="w-full p-1 border rounded"
                required
              />

              {/* Bed */}
              <div className="space-y-2">
                <select
                  name="bedId"
                  defaultValue={
                    entry.bed_id ? String(entry.bed_id) : "__none__"
                  }
                  required
                  onChange={(e) => {
                    if (e.target.value === "__new__") {
                      setBedSelectionMode("new");
                    } else {
                      setBedSelectionMode("existing");
                    }
                  }}
                  className="w-full p-1 border rounded"
                >
                  <option value="__none__" disabled>
                    Select a bed
                  </option>
                  {beds.map((bed) => (
                    <option key={bed.id} value={bed.id}>
                      {bed.name}
                    </option>
                  ))}
                  <option value="__new__" className="text-blue-600 italic">
                    ➕ Add New Bed
                  </option>
                </select>

                {bedSelectionMode === "new" && (
                  <input
                    type="text"
                    name="newBedName"
                    placeholder="Enter new bed name"
                    className="w-full p-1 border rounded"
                    required
                  />
                )}
              </div>

              {/* Tags */}
              <input
                name="tags"
                defaultValue={entry.tags.join(", ")}
                className="w-full p-1 border rounded"
                placeholder="Tags (comma separated)"
              />

              <div className="flex space-x-2 justify-end">
                <button
                  type="submit"
                  className="h-9 px-3 py-2 bg-green-500 text-white rounded"
                >
                  <FaRegSave />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="h-9 px-3 py-2 bg-gray-400 text-white rounded"
                >
                  <MdOutlineCancel />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  className="h-9 px-3 py-2 bg-red-500 text-white rounded"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </form>
          ) : (
            // ─── VIEW MODE ─────────────────────────────────────────
            <div className="flex justify-between items-center">
              <div className="text-left">
                <p className="text-sm text-gray-600">
                  Type: {entry.type === "todo" ? "To Do" : "Note"} • Date:{" "}
                  {entry.date}
                </p>
                <p>
                  Location:{" "}
                  <span className={entry.bed ? "" : "italic text-gray-500"}>
                    {entry.bed ?? "No bed assigned"}
                  </span>
                </p>
                <p className="font-bold">{entry.title}</p>
                {entry.tags.length > 0 && (
                  <p className="text-sm italic text-gray-500">
                    Tags: {entry.tags.join(", ")}
                  </p>
                )}
              </div>
              {/* Buttons div */}
              <div className="flex space-x-2">
                {/* To-do or checked off button  */}
                {entry.type === "todo" && (
                  <button
                    onClick={() => onToggle(entry.id)}
                    className={`h-9 flex items-center justify-center  px-3 py-2 rounded text-white ${
                      entry.completed ? "bg-gray-400" : "bg-blue-500"
                    }`}
                  >
                    {entry.completed ? <RiArrowGoBackLine /> : "✔️"}
                  </button>
                )}
                {/* //Edit button */}
                {!entry.completed && (
                  <button
                    className="h-9 flex items-center justify-center  px-3 py-2 rounded text-white bg-orange-400"
                    onClick={() => setEditingId(entry.id)}
                  >
                    <FaPencil />
                  </button>
                )}
                {/* //Delete button */}
                <button
                  onClick={() => onDelete(entry.id)}
                  className="h-9 flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

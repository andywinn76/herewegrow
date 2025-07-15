"use client";
import { useState } from "react";

export default function EntryForm({ onAdd, beds }) {
  const [date, setDate] = useState("");
  const [type, setType] = useState("note"); // default type
  const [title, setTitle] = useState("");
  const [tagsRaw, setTags] = useState("");
  const [bedSelectionMode, setBedSelectionMode] = useState("existing"); // or "new"
  const [bedId, setBedId] = useState("");
  const [newBedName, setNewBedName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // split + trim tags into an array of strings
    const tagList = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // call the onAdd prop with the form values
    onAdd({
      date,
      title,
      bedId,
      type,
      newBedName: bedSelectionMode === "new" ? newBedName : null,
      tags: tagList,
    });

    // reset the form
    setDate("");
    setType("note");
    setTitle("");
    setBedId("");
    setNewBedName("");
    setBedSelectionMode("existing");
    setTags("");
  }

  return (
    <form className="my-2 p-4 bg-white rounded shadow space-y-2"
      onSubmit={handleSubmit}
    >
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full p-2 border rounded"
        required
      >
        <option value="note">Note</option>
        <option value="todo">To-do</option>
      </select>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <div className="space-y-2">
        <select
          value={bedId}
          onChange={(e) => {
            if (e.target.value === "__new__") {
              setBedSelectionMode("new");
              setBedId("__new__");
            } else {
              setBedSelectionMode("existing");
              setBedId(e.target.value);
            }
          }}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select a bed</option>
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
            placeholder="Enter new bed name"
            value={newBedName}
            onChange={(e) => setNewBedName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        )}
      </div>

      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={tagsRaw}
        onChange={(e) => setTags(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <button
        type="submit"
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Add Entry
      </button>
    </form>
  );
}

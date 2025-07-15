import { useState } from "react";

export default function EntryForm({ onAdd }) {
  const [date, setDate]     = useState("");
  const [title, setTitle]   = useState("");
  const [bedName, setBed]   = useState("");
  const [tagsRaw, setTags]  = useState("");

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
      bedName,
      tags: tagList,
    });

    // reset the form
    setDate("");
    setTitle("");
    setBed("");
    setTags("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white rounded shadow space-y-2"
    >
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="text"
        placeholder="Bed (e.g. NW bed)"
        value={bedName}
        onChange={(e) => setBed(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

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

import { useState } from "react";

export default function EntryList({ entries, dispatch }) {
  const [editingId, setEditingId] = useState(null);

  return (
    <div className="space-y-4 mt-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`p-4 rounded shadow transition-colors ${
            entry.type === "todo" && entry.completed
              ? "bg-green-100 text-green-800"
              : "bg-gray-100"
          }`}
        >
          <div className="flex justify-between items-center">
            {editingId === entry.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  dispatch({
                    type: "UPDATE_ENTRY",
                    payload: {
                      id: entry.id,
                      updates: {
                        title: e.target.title.value,
                        bed: e.target.bed.value,
                        tags: e.target.tags.value
                          .split(",")
                          .map((t) => t.trim()),
                      },
                    },
                  });
                  setEditingId(null);
                }}
                className="space-y-2"
              >
                <input
                  name="title"
                  defaultValue={entry.title}
                  className="w-full p-1 border rounded"
                />
                <input
                  name="bed"
                  defaultValue={entry.bed}
                  className="w-full p-1 border rounded"
                />
                <input
                  name="tags"
                  defaultValue={entry.tags.join(", ")}
                  className="w-full p-1 border rounded"
                />
                <div className="space-x-2">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-green-500 text-white rounded"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 bg-gray-400 text-white rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-left">
                <p className="text-sm text-gray-600">
                  {entry.date} - Location: {entry.bed}
                </p>
                <p className="font-bold">{entry.title}</p>
                <p className="text-sm italic text-gray-500">
                  Tags: {entry.tags.join(", ")}
                </p>
              </div>
            )}
            <div className="flex space-x-2">
              {entry.type === "todo" && (
                <button
                  onClick={() =>
                    dispatch({ type: "TOGGLE_TODO", payload: entry.id })
                  }
                  className={`px-3 py-1 rounded text-white ${
                    entry.completed ? "bg-gray-400" : "bg-blue-500"
                  }`}
                >
                  {entry.completed ? "✔️ Done" : "Mark Done"}
                </button>
              )}
              {!entry.completed && editingId !== entry.id && (
                <button className="px-3 py-1 rounded text-white bg-orange-400" onClick={() => setEditingId(entry.id)}>
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

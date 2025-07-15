// // src/components/RlsTester.jsx
// import React, { useEffect, useState } from "react";
// import { supabase } from "../lib/supabaseClient";

// export default function RlsTester() {
//   const [results, setResults] = useState([]);

//   useEffect(() => {
//     async function runTests() {
//       const {
//         data: { user },
//         error: userError,
//       } = await supabase.auth.getUser();
//       if (userError || !user) {
//         throw new Error(
//           "Could not fetch logged-in user: " + userError?.message
//         );
//       }

//       const out = [];

//       // 1. Fetch beds (should only return your beds)
//       const { data: beds, error: bedsError } = await supabase
//         .from("beds")
//         .select("*");
//       out.push({ test: "Fetch beds", error: bedsError, data: beds });

//       // 2. Insert a new bed
//       const { data: newBed, error: bedInsertError } = await supabase
//         .from("beds")
//         .insert({
//           name: `Test Bed ${Date.now()}`,
//           description: "RLS test bed",
//           created_by: user.id,
//         });
//       out.push({ test: "Insert bed", error: bedInsertError, data: newBed });

//       // 3. Create & fetch an entry
//       const entryPayload = {
//         user_id: user.id,
//         bed_id: newBed?.[0]?.id,
//         title: "RLS Test Entry",
//         body: "Testing entries policy",
//         entry_date: new Date().toISOString().slice(0, 10),
//       };
//       const { data: newEntry, error: entryInsertError } = await supabase
//         .from("entries")
//         .insert(entryPayload);
//       out.push({
//         test: "Insert entry",
//         error: entryInsertError,
//         data: newEntry,
//       });

//       const { data: entries, error: entriesError } = await supabase
//         .from("entries")
//         .select("*");
//       out.push({ test: "Fetch entries", error: entriesError, data: entries });

//       // 4. Create & fetch a tag + entry_tag
//       const { data: newTag, error: tagInsertError } = await supabase
//         .from("tags")
//         .insert({ name: `tag_${Date.now()}`, created_by: user.id });
//       out.push({ test: "Insert tag", error: tagInsertError, data: newTag });

//       const etPayload = {
//         entry_id: newEntry?.[0]?.id,
//         tag_id: newTag?.[0]?.id,
//       };
//       const { data: newEntryTag, error: etInsertError } = await supabase
//         .from("entry_tags")
//         .insert(etPayload);
//       out.push({
//         test: "Insert entry_tag",
//         error: etInsertError,
//         data: newEntryTag,
//       });

//       const { data: entryTags, error: etFetchError } = await supabase
//         .from("entry_tags")
//         .select("*");
//       out.push({
//         test: "Fetch entry_tags",
//         error: etFetchError,
//         data: entryTags,
//       });

//       setResults(out);
//     }

//     runTests();
//   }, []);

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>RLS Test Results</h2>
//       {results.map(({ test, error, data }, i) => (
//         <div key={i} style={{ marginBottom: 12 }}>
//           <strong>{test}</strong>
//           <div>
//             {error ? (
//               <code style={{ color: "crimson" }}>{error.message}</code>
//             ) : (
//               <pre style={{ background: "#f0f0f0", padding: 8 }}>
//                 {JSON.stringify(data, null, 2)}
//               </pre>
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }
// src/components/RlsTester.jsx
// src/components/RlsTester.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function RlsTester() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function runTests() {
      const out = [];

      // 1. Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        out.push({
          test: "Get user",
          error: userError ?? new Error("No session"),
          data: user,
        });
        return setResults(out);
      }
      out.push({
        test: "Get user",
        error: null,
        data: { id: user.id, email: user.email },
      });

      // 2. Fetch beds
      const { data: beds, error: bedsError } = await supabase
        .from("beds")
        .select("*");
      out.push({ test: "Fetch beds", error: bedsError, data: beds });

      // 3. Insert a new bed AND return it
      const { data: newBed, error: bedInsertError } = await supabase
        .from("beds")
        .insert({
          name: `Test Bed ${Date.now()}`,
          description: "RLS test bed",
          created_by: user.id,
        })
        .select()
        .single();
      out.push({ test: "Insert bed", error: bedInsertError, data: newBed });

      // guard against failure
      if (bedInsertError || !newBed?.id) {
        return setResults(out);
      }

      // 4. Insert a new entry for that bed AND return it
      const { data: newEntry, error: entryInsertError } = await supabase
        .from("entries")
        .insert({
          user_id: user.id,
          bed_id: newBed.id,
          title: "RLS Test Entry",
          body: "Testing entries policy",
          entry_date: new Date().toISOString().slice(0, 10),
        })
        .select()
        .single();
      out.push({
        test: "Insert entry",
        error: entryInsertError,
        data: newEntry,
      });

      // guard again
      if (entryInsertError || !newEntry?.id) {
        return setResults(out);
      }

      // 5. Create & return a tag
      const { data: newTag, error: tagInsertError } = await supabase
        .from("tags")
        .insert({ name: `tag_${Date.now()}`, created_by: user.id })
        .select()
        .single();
      out.push({ test: "Insert tag", error: tagInsertError, data: newTag });

      if (tagInsertError || !newTag?.id) {
        return setResults(out);
      }

      // 6. Link them in entry_tags AND return
      const { data: newEntryTag, error: etInsertError } = await supabase
        .from("entry_tags")
        .insert({
          entry_id: newEntry.id,
          tag_id: newTag.id,
        })
        .select()
        .single();
      out.push({
        test: "Insert entry_tag",
        error: etInsertError,
        data: newEntryTag,
      });

      // 7. Finally fetch everything to confirm
      const { data: entryTags, error: etFetchError } = await supabase
        .from("entry_tags")
        .select("*");
      out.push({
        test: "Fetch entry_tags",
        error: etFetchError,
        data: entryTags,
      });

      setResults(out);
    }

    runTests();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>RLS Test Results</h2>
      {results.map(({ test, error, data }, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <strong>{test}</strong>
          <div>
            {error ? (
              <code style={{ color: "crimson" }}>{error.message}</code>
            ) : (
              <pre style={{ background: "#f0f0f0", padding: 8 }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

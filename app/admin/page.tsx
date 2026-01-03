"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Shop = {
  id: string;
  name: string;
  website_url: string | null;
  created_at: string;
};

export default function AdminPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("shops")
        .select("id, name, website_url, created_at")
        .order("created_at", { ascending: false });

      if (error) setError(error.message);
      else setShops((data as Shop[]) ?? []);

      setLoading(false);
    })();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Admin</h1>
      <p style={{ marginTop: 6, opacity: 0.75 }}>
        Test de lecture Supabase (table <b>shops</b>)
      </p>

      {loading && <p>Chargement…</p>}

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: "#fee" }}>
          <b>Erreur Supabase:</b> {error}
        </div>
      )}

      <h2 style={{ marginTop: 24, fontSize: 18, fontWeight: 600 }}>Shops</h2>

      <ul style={{ marginTop: 12 }}>
        {shops.map((s) => (
          <li key={s.id} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 600 }}>{s.name}</div>
            {s.website_url ? (
              <a href={s.website_url} target="_blank" rel="noreferrer">
                {s.website_url}
              </a>
            ) : (
              <div style={{ opacity: 0.6 }}>Pas d’URL</div>
            )}
          </li>
        ))}
      </ul>

      {!loading && !error && shops.length === 0 && (
        <p style={{ opacity: 0.7 }}>Aucun shop trouvé.</p>
      )}
    </main>
  );
}

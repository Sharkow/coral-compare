"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Shop = {
  id: string;
  name: string;
  website_url: string | null;
};

type Listing = {
  id: string;
  shop_id: string;
  title_raw: string;
  url: string | null;
  price_cad: number | null;
  sale_price_cad: number | null;
  status: string;
  category: string;
  created_at: string;
};

export default function AdminPage() {
  // 🔐 AUTH SIMPLE
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");

  if (!authorized) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Admin</h1>
        <p>Mot de passe requis</p>
        <input
          type="password"
          placeholder="Mot de passe admin"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={() => {
            if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
              setAuthorized(true);
            } else {
              alert("Mot de passe incorrect");
            }
          }}
        >
          Entrer
        </button>
      </main>
    );
  }

  // ---------- SHOPS ----------
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopName, setShopName] = useState("");
  const [shopUrl, setShopUrl] = useState("");

  // ---------- LISTINGS ----------
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [titleRaw, setTitleRaw] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [priceCad, setPriceCad] = useState("");
  const [salePriceCad, setSalePriceCad] = useState("");
  const [category, setCategory] = useState("torch");
  const [status, setStatus] = useState("available");

  const shopsById = useMemo(() => {
    const m = new Map<string, Shop>();
    shops.forEach((s) => m.set(s.id, s));
    return m;
  }, [shops]);

  const loadShops = async () => {
    const { data } = await supabase
      .from("shops")
      .select("id, name, website_url")
      .order("created_at", { ascending: false });
    setShops(data ?? []);
    if (!selectedShopId && data && data.length > 0) setSelectedShopId(data[0].id);
  };

  const loadListings = async () => {
    const { data } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setListings((data as Listing[]) ?? []);
  };

  useEffect(() => {
    loadShops();
    loadListings();
  }, []);

  const addShop = async () => {
    if (!shopName.trim()) return;
    await supabase.from("shops").insert({
      name: shopName.trim(),
      website_url: shopUrl.trim() || null,
    });
    setShopName("");
    setShopUrl("");
    loadShops();
  };

  const deleteShop = async (id: string) => {
    await supabase.from("shops").delete().eq("id", id);
    loadShops();
    loadListings();
  };

  const addListing = async () => {
    if (!selectedShopId || !titleRaw.trim()) return;

    await supabase.from("listings").insert({
      shop_id: selectedShopId,
      title_raw: titleRaw.trim(),
      url: listingUrl.trim() || null,
      price_cad: priceCad ? Number(priceCad) : null,
      sale_price_cad: salePriceCad ? Number(salePriceCad) : null,
      category,
      status,
    });

    setTitleRaw("");
    setListingUrl("");
    setPriceCad("");
    setSalePriceCad("");
    loadListings();
  };

  const deleteListing = async (id: string) => {
    await supabase.from("listings").delete().eq("id", id);
    loadListings();
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Admin sécurisé</h1>

      <h2>Shops</h2>
      <input placeholder="Nom" value={shopName} onChange={(e) => setShopName(e.target.value)} />
      <input placeholder="URL" value={shopUrl} onChange={(e) => setShopUrl(e.target.value)} />
      <button onClick={addShop}>Ajouter shop</button>

      <ul>
        {shops.map((s) => (
          <li key={s.id}>
            {s.name} <button onClick={() => deleteShop(s.id)}>❌</button>
          </li>
        ))}
      </ul>

      <hr />

      <h2>Ajouter un corail</h2>
      <select value={selectedShopId} onChange={(e) => setSelectedShopId(e.target.value)}>
        <option value="">Choisir un shop</option>
        {shops.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <input placeholder="Titre" value={titleRaw} onChange={(e) => setTitleRaw(e.target.value)} />
      <input placeholder="URL" value={listingUrl} onChange={(e) => setListingUrl(e.target.value)} />
      <input placeholder="Prix" value={priceCad} onChange={(e) => setPriceCad(e.target.value)} />
      <button onClick={addListing}>Ajouter corail</button>

      <ul>
        {listings.map((l) => (
          <li key={l.id}>
            {l.title_raw} <button onClick={() => deleteListing(l.id)}>❌</button>
          </li>
        ))}
      </ul>
    </main>
  );
}

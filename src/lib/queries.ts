import { supabase } from "./supabase";

export type Album = {
  id: string;
  code: string;
  edition_year: number;
  is_active: boolean;
};

export type SectionStats = { total: number; owned: number };

export async function getActiveAlbum(): Promise<Album | null> {
  const { data } = await supabase
    .from("albums")
    .select("id, code, edition_year, is_active")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getCollectorCard(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select(
      "username, display_name, avatar_url, collector_card_base64, city, country",
    )
    .eq("id", userId)
    .maybeSingle();
  return data;
}

/** Stats globales del usuario en el álbum activo */
export async function getUserStats(userId: string, albumId: string) {
  const [{ data: stickers }, { data: rows }] = await Promise.all([
    supabase.from("stickers").select("id").eq("album_id", albumId),
    supabase
      .from("user_stickers")
      .select("sticker_id, quantity")
      .eq("user_id", userId),
  ]);

  const total = stickers?.length ?? 0;
  const ownedRows = (rows ?? []).filter((r) => (r.quantity ?? 0) > 0);
  const owned = ownedRows.length;
  const duplicates = (rows ?? []).reduce(
    (acc, r) => acc + Math.max(0, (r.quantity ?? 0) - 1),
    0,
  );
  const missing = Math.max(0, total - owned);
  const percent = total > 0 ? Math.round((owned / total) * 100) : 0;
  return { total, owned, missing, duplicates, percent };
}

/** Stats por sección — 1 viaje a DB para stickers, 1 para user_stickers */
export async function getAllSectionStats(userId: string, albumId: string) {
  const [{ data: stickers }, { data: owned }] = await Promise.all([
    supabase
      .from("stickers")
      .select("id, group_code, page")
      .eq("album_id", albumId),
    supabase
      .from("user_stickers")
      .select("sticker_id, quantity")
      .eq("user_id", userId)
      .gt("quantity", 0),
  ]);

  const ownedSet = new Set((owned ?? []).map((r) => r.sticker_id as string));
  const stats = new Map<string, SectionStats>();

  (stickers ?? []).forEach((s) => {
    let key: string;
    if (s.group_code) {
      key = (s.group_code as string).toUpperCase();
    } else {
      const p = (s.page as number | null) ?? 0;
      if (p < 100) key = "apertura";
      else if (p < 110) key = "historia";
      else if (p < 120) key = "coca-cola";
      else key = "other";
    }
    const entry = stats.get(key) ?? { total: 0, owned: 0 };
    entry.total += 1;
    if (ownedSet.has(s.id as string)) entry.owned += 1;
    stats.set(key, entry);
  });

  return stats;
}

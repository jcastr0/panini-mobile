import { supabase } from "./supabase";
import type { GroupCode, SpecialKey } from "./album-config";

export type Album = {
  id: string;
  code: string;
  edition_year: number;
  is_active: boolean;
};

export type SectionStats = { total: number; owned: number };

export type Sticker = {
  id: string;
  code: string | null;
  number: number;
  name: string;
  team: string | null;
  type: "normal" | "shiny" | "legend" | "special";
  page: number | null;
  group_code: string | null;
};

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

/** Stickers de un grupo específico, con sus cantidades del usuario */
export async function getStickersByGroup(
  albumId: string,
  code: GroupCode,
  userId: string,
) {
  const [{ data: stickers }, { data: rows }] = await Promise.all([
    supabase
      .from("stickers")
      .select("id, code, number, name, team, type, page, group_code")
      .eq("album_id", albumId)
      .eq("group_code", code.toLowerCase())
      .order("team", { ascending: true })
      .order("number", { ascending: true }),
    supabase
      .from("user_stickers")
      .select("sticker_id, quantity")
      .eq("user_id", userId),
  ]);
  const qtyMap = new Map<string, number>();
  (rows ?? []).forEach((r) =>
    qtyMap.set(r.sticker_id as string, (r.quantity as number) ?? 0),
  );
  return { stickers: (stickers ?? []) as Sticker[], qtyMap };
}

/** Stickers de una sección especial (apertura/historia/coca-cola) */
export async function getStickersBySpecialSection(
  albumId: string,
  section: SpecialKey,
  userId: string,
) {
  // Las secciones especiales son group_code IS NULL, paginadas por rango de page
  const range =
    section === "apertura"
      ? { from: 0, to: 99 }
      : section === "historia"
        ? { from: 100, to: 109 }
        : { from: 110, to: 119 };

  const [{ data: stickers }, { data: rows }] = await Promise.all([
    supabase
      .from("stickers")
      .select("id, code, number, name, team, type, page, group_code")
      .eq("album_id", albumId)
      .is("group_code", null)
      .gte("page", range.from)
      .lte("page", range.to)
      .order("page", { ascending: true })
      .order("number", { ascending: true }),
    supabase
      .from("user_stickers")
      .select("sticker_id, quantity")
      .eq("user_id", userId),
  ]);
  const qtyMap = new Map<string, number>();
  (rows ?? []).forEach((r) =>
    qtyMap.set(r.sticker_id as string, (r.quantity as number) ?? 0),
  );
  return { stickers: (stickers ?? []) as Sticker[], qtyMap };
}

export type TradeStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

export type TradeSummary = {
  id: string;
  from_user: string;
  to_user: string;
  status: TradeStatus;
  message: string | null;
  created_at: string;
  updated_at: string | null;
  rejected_reason: string | null;
  other_username: string | null;
  other_display_name: string | null;
  /** Direccion vs el usuario actual: "incoming" si me la mandaron a mí */
  direction: "incoming" | "outgoing";
};

export type TradeItem = {
  sticker_id: string;
  direction: "offer" | "request";
  quantity_traded: number;
  sticker: {
    code: string | null;
    number: number;
    name: string;
    team: string | null;
  } | null;
};

/** Lista de trades del usuario. Dos viajes a DB (trades + profiles) para esquivar
 * el join via auth.users que Postgrest no expone directo. */
export async function getTradesForUser(userId: string): Promise<TradeSummary[]> {
  const { data: trades } = await supabase
    .from("trades")
    .select(
      "id, from_user, to_user, status, message, created_at, updated_at, rejected_reason",
    )
    .or(`from_user.eq.${userId},to_user.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (!trades || trades.length === 0) return [];

  const otherIds = new Set<string>();
  trades.forEach((t: any) => {
    otherIds.add(t.from_user === userId ? t.to_user : t.from_user);
  });

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", [...otherIds]);
  const pMap = new Map(
    (profiles ?? []).map((p: any) => [
      p.id as string,
      { username: p.username as string | null, display_name: p.display_name as string | null },
    ]),
  );

  return trades.map((t: any): TradeSummary => {
    const direction: "incoming" | "outgoing" =
      t.to_user === userId ? "incoming" : "outgoing";
    const otherId = direction === "incoming" ? t.from_user : t.to_user;
    const p = pMap.get(otherId);
    return {
      id: t.id,
      from_user: t.from_user,
      to_user: t.to_user,
      status: t.status,
      message: t.message,
      created_at: t.created_at,
      updated_at: t.updated_at,
      rejected_reason: t.rejected_reason,
      other_username: p?.username ?? null,
      other_display_name: p?.display_name ?? null,
      direction,
    };
  });
}

export async function getTradeDetail(tradeId: string, userId: string) {
  const { data: trade } = await supabase
    .from("trades")
    .select(
      "id, from_user, to_user, status, message, created_at, updated_at, rejected_reason",
    )
    .eq("id", tradeId)
    .maybeSingle();

  if (!trade) return { trade: null, items: [] as TradeItem[], otherProfile: null };

  const otherId = (trade as any).to_user === userId
    ? (trade as any).from_user
    : (trade as any).to_user;

  const [{ data: items }, { data: profile }] = await Promise.all([
    supabase
      .from("trade_items")
      .select(
        "sticker_id, direction, quantity_traded, sticker:stickers(code, number, name, team)",
      )
      .eq("trade_id", tradeId),
    supabase
      .from("profiles")
      .select("username, display_name")
      .eq("id", otherId)
      .maybeSingle(),
  ]);

  // Supabase devuelve sticker como array cuando el embed es 1:1 sin alias;
  // lo aplanamos para que cada item tenga sticker como objeto único.
  const flatItems: TradeItem[] = (items ?? []).map((it: any) => ({
    sticker_id: it.sticker_id,
    direction: it.direction,
    quantity_traded: it.quantity_traded,
    sticker: Array.isArray(it.sticker) ? it.sticker[0] ?? null : it.sticker,
  }));

  return {
    trade: trade as any,
    items: flatItems,
    otherProfile: profile as { username: string; display_name: string | null } | null,
  };
}

export async function acceptTrade(tradeId: string) {
  const { error } = await supabase.rpc("accept_trade", { p_trade_id: tradeId });
  return error ? { error: error.message } : {};
}

export async function completeTrade(tradeId: string) {
  const { error } = await supabase.rpc("complete_trade", {
    p_trade_id: tradeId,
  });
  return error ? { error: error.message } : {};
}

export async function rejectTrade(tradeId: string) {
  const { error } = await supabase
    .from("trades")
    .update({ status: "rejected" })
    .eq("id", tradeId);
  return error ? { error: error.message } : {};
}

/**
 * Actualiza la cantidad de un cromo del usuario.
 * - qty 0 → delete row
 * - qty >= 1 → upsert
 */
export async function setStickerQuantity(
  userId: string,
  stickerId: string,
  quantity: number,
): Promise<{ error?: string }> {
  if (quantity < 0) return { error: "Cantidad inválida" };
  if (quantity === 0) {
    const { error } = await supabase
      .from("user_stickers")
      .delete()
      .eq("user_id", userId)
      .eq("sticker_id", stickerId);
    if (error) return { error: error.message };
    return {};
  }
  const { error } = await supabase
    .from("user_stickers")
    .upsert(
      { user_id: userId, sticker_id: stickerId, quantity },
      { onConflict: "user_id,sticker_id" },
    );
  if (error) return { error: error.message };
  return {};
}

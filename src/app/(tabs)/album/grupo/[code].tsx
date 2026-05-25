import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/lib/auth";
import {
  getActiveAlbum,
  getStickersByGroup,
  type Sticker,
} from "@/lib/queries";
import {
  GROUP_CODES,
  GROUP_PALETTES,
  GROUP_TEAMS,
  type GroupCode,
  type TeamInfo,
} from "@/lib/album-config";
import { SectionStickerList } from "@/components/section-sticker-list";

const GROUP_ACCENT_HEX: Record<GroupCode, string> = {
  A: "#c44a3a",
  B: "#3b7fcc",
  C: "#4a9966",
  D: "#9a4dd1",
  E: "#c69b3f",
  F: "#cc4a9a",
  G: "#3a8c9e",
  H: "#d1873a",
  I: "#9a3acc",
  J: "#5050cc",
  K: "#7fa83a",
  L: "#a83a3a",
};

export default function GroupScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { user } = useAuth();
  const upper = (code ?? "A").toUpperCase() as GroupCode;
  const isValid = GROUP_CODES.includes(upper);

  const [loading, setLoading] = useState(true);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [qtyMap, setQtyMap] = useState<Map<string, number>>(new Map());
  const [activeTeam, setActiveTeam] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isValid) return;
    (async () => {
      const a = await getActiveAlbum();
      if (!a) {
        setLoading(false);
        return;
      }
      const { stickers, qtyMap } = await getStickersByGroup(a.id, upper, user.id);
      setStickers(stickers);
      setQtyMap(qtyMap);
      // Equipo activo por defecto = el primero del grupo
      const first = GROUP_TEAMS[upper][0]?.name ?? null;
      setActiveTeam(first);
      setLoading(false);
    })();
  }, [user, upper, isValid]);

  if (!isValid) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-gray-600 text-center">Grupo no encontrado</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1f3aa5" />
      </View>
    );
  }

  const accent = GROUP_ACCENT_HEX[upper];
  const palette = GROUP_PALETTES[upper];
  const teams: TeamInfo[] = GROUP_TEAMS[upper];

  const activeStickers = activeTeam
    ? stickers.filter((s) => s.team === activeTeam)
    : stickers;

  const groupOwned = stickers.filter((s) => (qtyMap.get(s.id) ?? 0) >= 1).length;
  const groupTotal = stickers.length;
  const groupPercent =
    groupTotal > 0 ? Math.round((groupOwned / groupTotal) * 100) : 0;
  const teamOwned = activeStickers.filter(
    (s) => (qtyMap.get(s.id) ?? 0) >= 1,
  ).length;
  const teamTotal = activeStickers.length;

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
    >
      {/* Hero: grupo principal, equipo subtítulo */}
      <View
        className="rounded-2xl p-4 mb-4"
        style={{ backgroundColor: accent + "11" }}
      >
        <Text className="text-[10px] uppercase tracking-widest text-gray-500">
          Grupo · {palette.tag}
        </Text>
        <Text className="text-5xl font-black" style={{ color: accent }}>
          {upper}
        </Text>
        <View className="flex-row items-center gap-3 mt-3">
          <View className="flex-1 h-2 rounded-full bg-white overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{ width: `${groupPercent}%`, backgroundColor: accent }}
            />
          </View>
          <Text
            className="font-mono text-sm font-semibold"
            style={{ color: accent }}
          >
            {groupOwned}/{groupTotal}
          </Text>
        </View>
        {activeTeam && (
          <Text className="text-xs text-gray-600 mt-2">
            {teams.find((t) => t.name === activeTeam)?.flag}{" "}
            <Text className="font-semibold">{activeTeam}</Text> · {teamOwned}/
            {teamTotal}
          </Text>
        )}
      </View>

      {/* Selector de equipos */}
      <View className="flex-row flex-wrap -mx-1 mb-4">
        {teams.map((t) => {
          const tStickers = stickers.filter((s) => s.team === t.name);
          const tOwned = tStickers.filter(
            (s) => (qtyMap.get(s.id) ?? 0) >= 1,
          ).length;
          const active = t.name === activeTeam;
          return (
            <View key={t.name} className="w-1/2 px-1 mb-2">
              <Pressable
                onPress={() => setActiveTeam(t.name)}
                className="rounded-xl border p-2.5 active:opacity-80"
                style={{
                  borderColor: active ? accent : "#e5e7eb",
                  backgroundColor: active ? accent + "11" : "#fff",
                  borderWidth: active ? 2 : 1,
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Text style={{ fontSize: 22 }}>{t.flag}</Text>
                  <View className="flex-1 min-w-0">
                    <Text
                      className="text-xs font-bold"
                      style={{ color: active ? accent : "#111827" }}
                      numberOfLines={1}
                    >
                      {t.paniniCode} · {t.name}
                    </Text>
                    <Text className="text-[10px] font-mono text-gray-500">
                      {tOwned}/{tStickers.length}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Stickers del equipo activo */}
      <SectionStickerList
        stickers={activeStickers}
        qtyMap={qtyMap}
        accent={accent}
      />
    </ScrollView>
  );
}

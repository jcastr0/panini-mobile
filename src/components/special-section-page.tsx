import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useAuth } from "@/lib/auth";
import {
  getActiveAlbum,
  getStickersBySpecialSection,
  type Sticker,
} from "@/lib/queries";
import { SPECIAL_SECTIONS, type SpecialKey } from "@/lib/album-config";
import { SectionStickerList } from "./section-sticker-list";

const ACCENT: Record<SpecialKey, string> = {
  apertura: "#3f8c5f",
  historia: "#d4a64a",
  "coca-cola": "#c43a3a",
};

export function SpecialSectionPage({ sectionKey }: { sectionKey: SpecialKey }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [qtyMap, setQtyMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!user) return;
    (async () => {
      const a = await getActiveAlbum();
      if (!a) {
        setLoading(false);
        return;
      }
      const { stickers, qtyMap } = await getStickersBySpecialSection(
        a.id,
        sectionKey,
        user.id,
      );
      setStickers(stickers);
      setQtyMap(qtyMap);
      setLoading(false);
    })();
  }, [user, sectionKey]);

  const section = SPECIAL_SECTIONS[sectionKey];
  const accent = ACCENT[sectionKey];
  const owned = stickers.filter((s) => (qtyMap.get(s.id) ?? 0) >= 1).length;
  const total = stickers.length;
  const percent = total > 0 ? Math.round((owned / total) * 100) : 0;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={accent} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
    >
      {/* Hero compacto */}
      <View
        className="rounded-2xl p-4 mb-4"
        style={{ backgroundColor: accent + "11" }}
      >
        <Text className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
          Sección
        </Text>
        <Text className="text-3xl font-black" style={{ color: accent }}>
          {section.emoji} {section.label}
        </Text>
        <View className="flex-row items-center gap-3 mt-3">
          <View className="flex-1 h-2 rounded-full bg-white overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{ width: `${percent}%`, backgroundColor: accent }}
            />
          </View>
          <Text
            className="font-mono text-sm font-semibold"
            style={{ color: accent }}
          >
            {owned}/{total}
          </Text>
        </View>
      </View>

      <SectionStickerList
        stickers={stickers}
        qtyMap={qtyMap}
        accent={accent}
      />
    </ScrollView>
  );
}

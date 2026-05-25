import { Pressable, Text, View } from "react-native";
import {
  GROUP_PALETTES,
  GROUP_TEAMS,
  SPECIAL_SECTIONS,
  type GroupCode,
  type SpecialKey,
} from "@/lib/album-config";

type SectionKey = GroupCode | SpecialKey;

export function SectionTile({
  sectionKey,
  owned,
  total,
  onPress,
}: {
  sectionKey: SectionKey;
  owned: number;
  total: number;
  onPress?: () => void;
}) {
  const isGroup = sectionKey.length === 1;
  const palette = isGroup
    ? GROUP_PALETTES[sectionKey as GroupCode]
    : SPECIAL_SECTIONS[sectionKey as SpecialKey];
  const percent = total > 0 ? Math.round((owned / total) * 100) : 0;
  const complete = total > 0 && owned === total;

  const label = isGroup
    ? `Grupo ${sectionKey as GroupCode}`
    : SPECIAL_SECTIONS[sectionKey as SpecialKey].label;
  const subtitle = isGroup
    ? GROUP_PALETTES[sectionKey as GroupCode].tag
    : null;
  const emoji = isGroup ? null : SPECIAL_SECTIONS[sectionKey as SpecialKey].emoji;

  // tint pastel ya viene en oklch — para RN usamos un fallback genérico,
  // el accent se aplica al texto del título (vibrante) y a la barra
  const accent = isGroup
    ? GROUP_ACCENT_HEX[sectionKey as GroupCode]
    : SPECIAL_ACCENT_HEX[sectionKey as SpecialKey];

  const flags = isGroup
    ? GROUP_TEAMS[sectionKey as GroupCode].slice(0, 4)
    : [];

  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl border border-gray-200 p-3 bg-white active:opacity-80"
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      <View className="flex-row items-start justify-between gap-2 mb-2">
        <View className="flex-1 min-w-0">
          <Text className="text-[10px] uppercase tracking-widest text-gray-400">
            {isGroup ? "Grupo" : "Sección"}
          </Text>
          <Text
            className="font-black text-lg leading-tight"
            style={{ color: accent }}
            numberOfLines={1}
          >
            {emoji ? `${emoji} ` : ""}
            {isGroup ? (sectionKey as string) : label}
          </Text>
          {subtitle && (
            <Text className="text-[11px] text-gray-500" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        {complete && (
          <View
            className="px-1.5 py-0.5 rounded"
            style={{ backgroundColor: accent }}
          >
            <Text className="text-[9px] font-bold text-white">100%</Text>
          </View>
        )}
      </View>

      {flags.length > 0 && (
        <View className="flex-row gap-1 mb-2">
          {flags.map((t) => (
            <Text key={t.name} style={{ fontSize: 14 }} aria-hidden>
              {t.flag}
            </Text>
          ))}
        </View>
      )}

      <View className="gap-1">
        <View className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              width: `${percent}%`,
              backgroundColor: accent,
            }}
          />
        </View>
        <View className="flex-row items-baseline justify-between">
          <Text
            className="font-mono text-xs text-gray-500"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {owned}/{total}
          </Text>
          <Text className="font-mono text-xs font-semibold" style={{ color: accent }}>
            {percent}%
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// Hex aprox de los oklch del web — para colores sólidos en RN
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

const SPECIAL_ACCENT_HEX: Record<SpecialKey, string> = {
  apertura: "#3f8c5f",
  historia: "#d4a64a",
  "coca-cola": "#c43a3a",
};

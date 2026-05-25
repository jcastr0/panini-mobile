import { Text, View } from "react-native";
import { StickerCard } from "./sticker-card";
import type { Sticker } from "@/lib/queries";

/**
 * Renderiza la lista de stickers de una sección como grid 2 columnas
 * (sin team blocks por ahora — para fase 3 simplificada).
 * Las teams blocks vendrán en una pasada de polish posterior.
 */
export function SectionStickerList({
  stickers,
  qtyMap,
  accent,
}: {
  stickers: Sticker[];
  qtyMap: Map<string, number>;
  accent: string;
}) {
  // Agrupar por equipo (si tienen team) — útil para grupos
  const byTeam = new Map<string, Sticker[]>();
  stickers.forEach((s) => {
    const key = s.team ?? "__nada";
    if (!byTeam.has(key)) byTeam.set(key, []);
    byTeam.get(key)!.push(s);
  });
  const teams = [...byTeam.entries()];

  return (
    <View className="gap-6">
      {teams.map(([team, list]) => {
        const ownedInTeam = list.filter(
          (s) => (qtyMap.get(s.id) ?? 0) >= 1,
        ).length;
        return (
          <View key={team} className="gap-2">
            {team !== "__nada" && (
              <View className="flex-row items-baseline justify-between">
                <Text className="font-bold text-lg tracking-tight">{team}</Text>
                <Text className="font-mono text-sm text-gray-500">
                  {ownedInTeam}/{list.length}
                </Text>
              </View>
            )}
            <View className="flex-row flex-wrap -mx-1">
              {list.map((s) => (
                <View key={s.id} className="w-1/2 px-1 mb-2">
                  <StickerCard
                    id={s.id}
                    code={s.code}
                    number={s.number}
                    name={s.name}
                    team={s.team}
                    type={s.type}
                    initialQuantity={qtyMap.get(s.id) ?? 0}
                    accent={accent}
                  />
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

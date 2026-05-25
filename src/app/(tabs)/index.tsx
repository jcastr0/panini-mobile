import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProgressRing } from "@/components/progress-ring";
import { SectionTile } from "@/components/section-tile";
import { useAuth } from "@/lib/auth";
import {
  getActiveAlbum,
  getAllSectionStats,
  getCollectorCard,
  getUserStats,
  type Album,
  type SectionStats,
} from "@/lib/queries";
import { SECTION_ORDER } from "@/lib/album-config";

type Card = {
  username: string | null;
  displayName: string | null;
};

export default function AlbumHomeScreen() {
  const { user } = useAuth();
  const [album, setAlbum] = useState<Album | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    owned: 0,
    missing: 0,
    duplicates: 0,
    percent: 0,
  });
  const [sectionStats, setSectionStats] = useState<Map<string, SectionStats>>(
    new Map(),
  );
  const [card, setCard] = useState<Card>({ username: null, displayName: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const a = await getActiveAlbum();
      if (!a) {
        setLoading(false);
        return;
      }
      setAlbum(a);
      const [s, sec, c] = await Promise.all([
        getUserStats(user.id, a.id),
        getAllSectionStats(user.id, a.id),
        getCollectorCard(user.id),
      ]);
      setStats(s);
      setSectionStats(sec);
      setCard({
        username: c?.username ?? null,
        displayName: c?.display_name ?? null,
      });
      setLoading(false);
    })();
  }, [user]);

  const greetName =
    card.displayName ?? (card.username ? `@${card.username}` : "coleccionista");

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1f3aa5" />
      </SafeAreaView>
    );
  }

  if (!album) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
        <Text className="text-base text-gray-600 text-center">
          No hay álbum activo configurado en Supabase.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-[10px] uppercase tracking-widest text-gray-400">
              Edición {album.edition_year}
            </Text>
            <Text className="font-black text-2xl text-panini-blue">
              Panini·JD
            </Text>
          </View>
          <Text className="text-xs text-gray-500">
            {card.username ? `@${card.username}` : ""}
          </Text>
        </View>

        {/* Hero: ProgressRing + saludo */}
        <View className="flex-row items-center gap-5 mb-8">
          <ProgressRing
            percent={stats.percent}
            size={140}
            label={`${stats.owned}/${stats.total}`}
          />
          <View className="flex-1">
            <Text className="text-2xl font-black tracking-tight" numberOfLines={2}>
              Hola, {greetName}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              {stats.percent === 100
                ? "¡Álbum completo!"
                : `Te ${stats.missing === 1 ? "falta" : "faltan"} ${stats.missing} cromo${stats.missing === 1 ? "" : "s"}.`}
            </Text>
            {stats.duplicates > 0 && (
              <Text className="text-xs text-gray-500 mt-2">
                {stats.duplicates} repetida{stats.duplicates === 1 ? "" : "s"}{" "}
                para cambio
              </Text>
            )}
          </View>
        </View>

        {/* Secciones */}
        <View className="mb-3">
          <Text className="text-lg font-bold tracking-tight">Tus secciones</Text>
          <Text className="text-xs text-gray-500">
            15 secciones · 12 grupos + apertura, historia y Coca-Cola
          </Text>
        </View>

        <View className="flex-row flex-wrap -mx-1">
          {SECTION_ORDER.map((key) => {
            const s = sectionStats.get(key) ?? { total: 0, owned: 0 };
            return (
              <View key={key} className="w-1/2 px-1 mb-2">
                <SectionTile sectionKey={key} owned={s.owned} total={s.total} />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

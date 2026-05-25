import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { getTradesForUser, type TradeSummary } from "@/lib/queries";

type Tab = "incoming" | "outgoing";

const STATUS_COLOR: Record<string, string> = {
  pending: "#d4a64a",
  accepted: "#3b7fcc",
  completed: "#3f8c5f",
  rejected: "#9ca3af",
  cancelled: "#9ca3af",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  completed: "Completada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
};

export default function TradesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("incoming");
  const [trades, setTrades] = useState<TradeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let cancelled = false;
      setLoading(true);
      getTradesForUser(user.id).then((data) => {
        if (cancelled) return;
        setTrades(data);
        setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }, [user]),
  );

  const filtered = trades.filter((t) => t.direction === tab);
  const pendingIn = trades.filter(
    (t) => t.direction === "incoming" && t.status === "pending",
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-6 pt-2 pb-4">
        <Text className="text-[10px] uppercase tracking-widest text-gray-400">
          Tus intercambios
        </Text>
        <Text className="text-3xl font-black text-panini-blue">Trades</Text>
      </View>

      {/* Tabs */}
      <View className="px-6 mb-4">
        <View className="flex-row gap-2 p-1 rounded-full bg-gray-100">
          <Pressable
            onPress={() => setTab("incoming")}
            className="flex-1 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: tab === "incoming" ? "#fff" : "transparent" }}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: tab === "incoming" ? "#1f3aa5" : "#6b7280" }}
            >
              Entrantes {pendingIn > 0 ? `· ${pendingIn}` : ""}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("outgoing")}
            className="flex-1 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: tab === "outgoing" ? "#fff" : "transparent" }}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: tab === "outgoing" ? "#1f3aa5" : "#6b7280" }}
            >
              Salientes
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1f3aa5"
            style={{ marginTop: 60 }}
          />
        ) : filtered.length === 0 ? (
          <View className="items-center justify-center py-16 gap-2">
            <Text className="text-6xl">🤝</Text>
            <Text className="text-base text-gray-500 text-center">
              {tab === "incoming"
                ? "No tienes propuestas pendientes"
                : "Aún no has propuesto intercambios"}
            </Text>
          </View>
        ) : (
          <View className="gap-2">
            {filtered.map((t) => {
              const color = STATUS_COLOR[t.status] ?? "#6b7280";
              const otherName =
                t.other_display_name ??
                (t.other_username ? `@${t.other_username}` : "alguien");
              return (
                <Pressable
                  key={t.id}
                  onPress={() => router.push(`/trades/${t.id}` as never)}
                  className="rounded-xl border border-gray-200 p-3 active:opacity-70"
                  style={{ borderLeftWidth: 3, borderLeftColor: color }}
                >
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="font-bold text-base" numberOfLines={1}>
                      {tab === "incoming" ? "De " : "A "}
                      <Text className="text-panini-blue">{otherName}</Text>
                    </Text>
                    <View
                      className="px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: color + "22" }}
                    >
                      <Text
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color }}
                      >
                        {STATUS_LABEL[t.status] ?? t.status}
                      </Text>
                    </View>
                  </View>
                  {t.message && (
                    <Text className="text-sm text-gray-600" numberOfLines={2}>
                      {t.message}
                    </Text>
                  )}
                  <Text className="text-[10px] text-gray-400 mt-1.5">
                    {new Date(t.created_at).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Check, X } from "lucide-react-native";
import { useAuth } from "@/lib/auth";
import {
  acceptTrade,
  completeTrade,
  getTradeDetail,
  rejectTrade,
  type TradeItem,
} from "@/lib/queries";

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

export default function TradeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [trade, setTrade] = useState<any>(null);
  const [items, setItems] = useState<TradeItem[]>([]);
  const [otherName, setOtherName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    if (!user || !id) return;
    setLoading(true);
    const { trade, items, otherProfile } = await getTradeDetail(id, user.id);
    setTrade(trade);
    setItems(items);
    setOtherName(
      otherProfile?.display_name ??
        (otherProfile?.username ? `@${otherProfile.username}` : null),
    );
    setLoading(false);
  }, [user, id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1f3aa5" />
      </View>
    );
  }

  if (!trade) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-gray-600">Intercambio no encontrado</Text>
      </View>
    );
  }

  const isReceiver = trade.to_user === user?.id;
  const isSender = trade.from_user === user?.id;
  const myItems = items.filter((i) =>
    isReceiver ? i.direction === "request" : i.direction === "offer",
  );
  const theirItems = items.filter((i) =>
    isReceiver ? i.direction === "offer" : i.direction === "request",
  );

  const statusColor = STATUS_COLOR[trade.status] ?? "#6b7280";

  async function handleAccept() {
    if (!id) return;
    setActing(true);
    const res = await acceptTrade(id);
    setActing(false);
    if (res.error) {
      Alert.alert("Error", res.error);
      return;
    }
    await load();
  }

  async function handleReject() {
    if (!id) return;
    Alert.alert("¿Rechazar la propuesta?", "El otro coleccionista verá que la rechazaste.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Rechazar",
        style: "destructive",
        onPress: async () => {
          setActing(true);
          const res = await rejectTrade(id);
          setActing(false);
          if (res.error) {
            Alert.alert("Error", res.error);
            return;
          }
          await load();
        },
      },
    ]);
  }

  async function handleComplete() {
    if (!id) return;
    Alert.alert(
      "¿Marcar como completada?",
      "Esto descuenta los cromos ofrecidos y suma los recibidos de ambos lados. No se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Completar",
          onPress: async () => {
            setActing(true);
            const res = await completeTrade(id);
            setActing(false);
            if (res.error) {
              Alert.alert("Error", res.error);
              return;
            }
            await load();
          },
        },
      ],
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      {/* Header */}
      <View
        className="rounded-2xl p-4 mb-4"
        style={{ backgroundColor: statusColor + "11" }}
      >
        <Text className="text-[10px] uppercase tracking-widest text-gray-500">
          {isReceiver ? "De" : "Para"}
        </Text>
        <Text className="text-2xl font-black mb-1">
          {otherName ?? "Alguien"}
        </Text>
        <View
          className="self-start px-2 py-0.5 rounded-full"
          style={{ backgroundColor: statusColor + "22" }}
        >
          <Text
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: statusColor }}
          >
            {STATUS_LABEL[trade.status] ?? trade.status}
          </Text>
        </View>
        {trade.message && (
          <Text className="text-sm text-gray-700 mt-3">{trade.message}</Text>
        )}
      </View>

      {/* Yo doy */}
      <View className="mb-5">
        <Text className="text-xs uppercase tracking-widest text-gray-500 mb-2">
          {isReceiver ? "Lo que te pide" : "Lo que ofreces"}
        </Text>
        <ItemList items={myItems} accent="#c43a3a" />
      </View>

      {/* Yo recibo */}
      <View className="mb-6">
        <Text className="text-xs uppercase tracking-widest text-gray-500 mb-2">
          {isReceiver ? "Lo que te ofrece" : "Lo que pides"}
        </Text>
        <ItemList items={theirItems} accent="#3f8c5f" />
      </View>

      {/* Acciones */}
      {trade.status === "pending" && isReceiver && (
        <View className="flex-row gap-3 mt-2">
          <Pressable
            onPress={handleReject}
            disabled={acting}
            className="flex-1 h-12 rounded-full border border-panini-red flex-row items-center justify-center gap-2 active:opacity-70 disabled:opacity-50"
          >
            <X size={18} color="#c43a3a" />
            <Text className="text-panini-red font-semibold">Rechazar</Text>
          </Pressable>
          <Pressable
            onPress={handleAccept}
            disabled={acting}
            className="flex-1 h-12 rounded-full bg-panini-blue flex-row items-center justify-center gap-2 active:opacity-80 disabled:opacity-50"
          >
            <Check size={18} color="#fff" />
            <Text className="text-white font-semibold">Aceptar</Text>
          </Pressable>
        </View>
      )}

      {trade.status === "accepted" && (isReceiver || isSender) && (
        <Pressable
          onPress={handleComplete}
          disabled={acting}
          className="h-12 rounded-full bg-pitch flex-row items-center justify-center gap-2 active:opacity-80 disabled:opacity-50 mt-2"
        >
          <Check size={18} color="#fff" />
          <Text className="text-white font-semibold">
            Marcar como completada
          </Text>
        </Pressable>
      )}

      {trade.rejected_reason && (
        <Text className="text-xs text-gray-500 text-center mt-3 italic">
          Razón: {trade.rejected_reason}
        </Text>
      )}
    </ScrollView>
  );
}

function ItemList({ items, accent }: { items: TradeItem[]; accent: string }) {
  if (items.length === 0) {
    return (
      <View className="rounded-xl border border-gray-200 p-3">
        <Text className="text-sm text-gray-400 italic">— sin cromos —</Text>
      </View>
    );
  }
  return (
    <View className="gap-2">
      {items.map((it, idx) => {
        const s = it.sticker;
        const code = s?.code
          ? /^\d+$/.test(s.code)
            ? `FWC${s.code}`
            : s.code
          : `#${String(s?.number ?? 0).padStart(3, "0")}`;
        return (
          <View
            key={idx}
            className="rounded-lg border border-gray-200 p-3 flex-row items-center justify-between"
            style={{ borderLeftWidth: 3, borderLeftColor: accent }}
          >
            <View className="flex-1 min-w-0">
              <Text
                className="font-mono font-black text-sm"
                style={{ color: accent }}
              >
                {code}
              </Text>
              <Text className="text-sm" numberOfLines={1}>
                {s?.team ?? s?.name ?? "—"}
              </Text>
              {s?.team && s.name !== s.team && (
                <Text className="text-xs text-gray-500" numberOfLines={1}>
                  {s.name}
                </Text>
              )}
            </View>
            <View className="px-2 py-1 rounded-md bg-gray-100">
              <Text className="font-mono font-bold text-sm">
                ×{it.quantity_traded}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

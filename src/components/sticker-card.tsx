import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Minus, Plus, Sparkles, Trash2 } from "lucide-react-native";
import { setStickerQuantity } from "@/lib/queries";
import { useAuth } from "@/lib/auth";

type Props = {
  id: string;
  code: string | null;
  number: number;
  name: string;
  team: string | null;
  type: "normal" | "shiny" | "legend" | "special";
  initialQuantity: number;
  /** Color de acento de la sección (texto del código + barra) */
  accent?: string;
};

export function StickerCard({
  id,
  code,
  number,
  name,
  team,
  type,
  initialQuantity,
  accent = "#1f3aa5",
}: Props) {
  const { user } = useAuth();
  const [qty, setQty] = useState(initialQuantity);
  const [pending, setPending] = useState(false);

  // Códigos puramente numéricos (apertura/historia "1".."19") se muestran
  // con prefijo "FWC" como en la web — la data en DB no cambia.
  const label = code
    ? /^\d+$/.test(code)
      ? `FWC${code}`
      : code
    : `#${String(number).padStart(3, "0")}`;
  const displayName = team ?? name;
  const owned = qty >= 1;
  const dup = qty > 1;
  const shiny = type === "shiny" || type === "legend";

  async function commit(next: number) {
    if (!user) return;
    const clamped = Math.max(0, Math.min(99, next));
    if (clamped === qty) return;
    const prev = qty;
    setQty(clamped); // optimistic
    setPending(true);
    const res = await setStickerQuantity(user.id, id, clamped);
    setPending(false);
    if (res.error) {
      setQty(prev);
      Alert.alert("Error", res.error);
    }
  }

  function handleDecrement() {
    if (qty === 1) {
      Alert.alert(
        `¿Despegar ${label}?`,
        `Vas a quitar ${displayName} de tu álbum. Si lo tenías como repetido, no se borran los demás.`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Despegar",
            style: "destructive",
            onPress: () => commit(0),
          },
        ],
      );
      return;
    }
    commit(qty - 1);
  }

  return (
    <View
      className="rounded-xl border p-2.5 gap-1.5"
      style={{
        backgroundColor: owned ? "#fff" : "#f9fafb",
        borderColor: owned ? accent + "44" : "#e5e7eb",
        opacity: pending ? 0.6 : 1,
      }}
    >
      {/* Código + shiny */}
      <View className="flex-row items-center justify-between">
        <Text
          className="font-mono font-black tracking-tight"
          style={{ color: accent, fontSize: 14, lineHeight: 14 }}
        >
          {label}
        </Text>
        {shiny && <Sparkles size={14} color="#d4a64a" />}
      </View>

      {/* Nombre */}
      <View
        className="rounded h-14 items-center justify-center px-1"
        style={{
          backgroundColor: owned ? accent + "11" : "#f3f4f6",
        }}
      >
        <Text
          className={`font-bold text-center ${owned ? "" : "italic"}`}
          numberOfLines={2}
          style={{
            color: owned ? "#111827" : "#9ca3af",
            fontSize: 12,
          }}
        >
          {displayName}
        </Text>
      </View>

      {team && team !== name && (
        <Text
          className="text-[10px] leading-tight"
          numberOfLines={1}
          style={{ color: owned ? "#374151" : "#9ca3af" }}
        >
          {name}
        </Text>
      )}

      {/* Controles +/- */}
      <View className="flex-row items-center justify-between mt-1">
        <Pressable
          onPress={handleDecrement}
          disabled={qty === 0 || pending}
          className="w-9 h-9 rounded-md border items-center justify-center active:opacity-60 disabled:opacity-30"
          style={{
            borderColor: qty === 1 ? "#c43a3a44" : "#e5e7eb",
          }}
        >
          {qty === 1 ? (
            <Trash2 size={16} color="#c43a3a" />
          ) : (
            <Minus size={16} color="#6b7280" />
          )}
        </Pressable>
        <Text
          className="font-mono font-bold text-base"
          style={{
            color: dup ? "#d4a64a" : owned ? "#111827" : "#9ca3af",
            fontVariant: ["tabular-nums"],
          }}
        >
          {qty}
        </Text>
        <Pressable
          onPress={() => commit(qty + 1)}
          disabled={pending}
          className="w-9 h-9 rounded-md border border-gray-200 items-center justify-center active:opacity-60 disabled:opacity-30"
        >
          <Plus size={16} color="#6b7280" />
        </Pressable>
      </View>
    </View>
  );
}

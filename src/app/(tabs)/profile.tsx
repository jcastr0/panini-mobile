import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut } from "lucide-react-native";
import { signOut, useAuth } from "@/lib/auth";

export default function ProfileScreen() {
  const { user } = useAuth();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-8 py-10 gap-8">
        <View className="gap-1">
          <Text className="text-xs uppercase tracking-widest text-gray-400">
            Tu cuenta
          </Text>
          <Text className="text-3xl font-black text-panini-blue">Mi perfil</Text>
        </View>

        <View className="rounded-xl border border-gray-200 p-4 gap-2">
          <Text className="text-[10px] uppercase tracking-widest text-gray-400">
            Email
          </Text>
          <Text className="text-base">{user?.email ?? "—"}</Text>
        </View>

        <Text className="text-sm text-gray-500">
          Próximamente: edición de display name, lámina del coleccionista y
          link público.
        </Text>

        <View className="mt-auto">
          <Pressable
            onPress={signOut}
            className="h-12 rounded-full border border-panini-red flex-row items-center justify-center gap-2 active:opacity-70"
          >
            <LogOut color="#c43a3a" size={18} />
            <Text className="text-panini-red font-semibold">Cerrar sesión</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8 gap-2">
        <Text className="text-xs uppercase tracking-widest text-gray-400">
          Próximamente
        </Text>
        <Text className="text-2xl font-black text-panini-blue">
          Crear intercambio
        </Text>
        <Text className="text-center text-gray-600 max-w-xs">
          Buscar a otros coleccionistas, elegir cromos a ofrecer y pedir.
        </Text>
      </View>
    </SafeAreaView>
  );
}

import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TradesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8 gap-2">
        <Text className="text-xs uppercase tracking-widest text-gray-400">
          Próximamente
        </Text>
        <Text className="text-2xl font-black text-panini-blue">
          Intercambios
        </Text>
        <Text className="text-center text-gray-600 max-w-xs">
          Propuestas entrantes, salientes y completadas.
        </Text>
      </View>
    </SafeAreaView>
  );
}

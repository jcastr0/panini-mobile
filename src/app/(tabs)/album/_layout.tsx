import { Stack } from "expo-router";

export default function AlbumStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#1f3aa5",
        headerTitleStyle: { fontWeight: "700" },
        headerBackTitle: "Álbum",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="grupo/[code]"
        options={{ title: "Grupo", headerShadowVisible: false }}
      />
      <Stack.Screen
        name="apertura"
        options={{ title: "Apertura", headerShadowVisible: false }}
      />
      <Stack.Screen
        name="historia"
        options={{ title: "Historia", headerShadowVisible: false }}
      />
      <Stack.Screen
        name="coca-cola"
        options={{ title: "Coca-Cola", headerShadowVisible: false }}
      />
    </Stack>
  );
}

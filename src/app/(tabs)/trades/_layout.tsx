import { Stack } from "expo-router";

export default function TradesStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#1f3aa5",
        headerTitleStyle: { fontWeight: "700" },
        headerBackTitle: "Trades",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{ title: "Intercambio", headerShadowVisible: false }}
      />
    </Stack>
  );
}

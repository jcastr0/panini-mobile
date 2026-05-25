import { Tabs } from "expo-router";
import {
  BookOpen,
  Layers,
  Plus,
  Repeat2,
  UserCircle2,
} from "lucide-react-native";

const PANINI_BLUE = "#1f3aa5";
const MUTED = "#6b7280";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PANINI_BLUE,
        tabBarInactiveTintColor: MUTED,
        tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Álbum",
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: "Colección",
          tabBarIcon: ({ color, size }) => <Layers color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          title: "Crear",
          tabBarIcon: ({ color, size }) => <Plus color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="trades"
        options={{
          title: "Trades",
          tabBarIcon: ({ color, size }) => (
            <Repeat2 color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Yo",
          tabBarIcon: ({ color, size }) => (
            <UserCircle2 color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

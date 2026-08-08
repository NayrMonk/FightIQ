import { Tabs } from "expo-router";
import { ColorValue, Text } from "react-native";

function TabIcon({ symbol, color }: { symbol: string; color: ColorValue }) {
  return <Text style={{ fontSize: 20, color }}>{symbol}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0A0A0B" },
        headerTintColor: "#fff",
        tabBarStyle: { backgroundColor: "#0A0A0B", borderTopColor: "#2A2A2B" },
        tabBarActiveTintColor: "#FF2E4D",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: ({ color }) => <TabIcon symbol="🏠" color={color} /> }}
      />
      <Tabs.Screen
        name="programmes"
        options={{ title: "Programmes", tabBarIcon: ({ color }) => <TabIcon symbol="📋" color={color} /> }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: "History", tabBarIcon: ({ color }) => <TabIcon symbol="🕓" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: ({ color }) => <TabIcon symbol="👤" color={color} /> }}
      />
    </Tabs>
  );
}

import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

const TabsLayout = () => {
  const { colors } = useTheme();

  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 100,
          paddingBottom: 20,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          textTransform: "none",
        },
        tabBarIndicatorStyle: {
          backgroundColor: colors.primary,
          height: 3,
          borderRadius: 3,
        },
        swipeEnabled: true,
        animationEnabled: true,
        tabBarShowIcon: true,
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: "Todos",
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="flash-outline" color={color} size={24} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="settings" color={color} size={24} />
          ),
        }}
      />
    </MaterialTopTabs>
  );
};

export default TabsLayout;

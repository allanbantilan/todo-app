import { AuthProvider } from "@/contexts/AuthContext";
import { SyncProvider } from "@/contexts/SyncContext";
import useTheme, { ThemeProvider } from "@/hooks/useTheme";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConvexReactClient } from "convex/react";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const convexUrl =
  Constants.expoConfig?.extra?.convexUrl ||
  process.env.EXPO_PUBLIC_CONVEX_URL ||
  "";

const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

// AsyncStorage adapter for ConvexAuthProvider
const storage = {
  getItem: async (key: string) => {
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};

function RootNavigator() {
  const { colors } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="auth"
          options={{
            title: "Authentication",
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            title: "Home",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <SyncProvider>
      <ConvexAuthProvider client={convex} storage={storage}>
        <AuthProvider>
          <ThemeProvider>
            <RootNavigator />
          </ThemeProvider>
        </AuthProvider>
      </ConvexAuthProvider>
    </SyncProvider>
  );
}

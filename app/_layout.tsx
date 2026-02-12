import { SyncProvider } from "@/contexts/SyncContext";
import { ThemeProvider } from "@/hooks/useTheme";
import { ConvexProvider, ConvexReactClient } from "convex/react";
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

export default function RootLayout() {
  return (
    <SyncProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ConvexProvider client={convex}>
          <ThemeProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen
                name="(tabs)"
                options={{
                  title: "Home",
                }}
              />
            </Stack>
          </ThemeProvider>
        </ConvexProvider>
      </GestureHandlerRootView>
    </SyncProvider>
  );
}

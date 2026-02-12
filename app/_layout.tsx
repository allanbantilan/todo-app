import { SyncProvider } from "@/contexts/SyncContext";
import { ThemeProvider } from "@/hooks/useTheme";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
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

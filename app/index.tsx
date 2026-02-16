import { useAuth } from "@/contexts/AuthContext";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import useTheme from "@/hooks/useTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const AUTH_SESSION_KEY = "@todo_app:has_authenticated_session";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isOnline, isLoading: isNetworkLoading } = useNetworkStatus();
  const { colors } = useTheme();
  const [hasAuthenticatedSession, setHasAuthenticatedSession] =
    useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadSessionFlag = async () => {
      try {
        const value = await AsyncStorage.getItem(AUTH_SESSION_KEY);
        if (mounted) {
          setHasAuthenticatedSession(value === "true");
        }
      } catch (error) {
        console.error("Failed to read auth session flag:", error);
        if (mounted) {
          setHasAuthenticatedSession(false);
        }
      }
    };

    loadSessionFlag();

    return () => {
      mounted = false;
    };
  }, []);

  const canOpenOffline = !isOnline && hasAuthenticatedSession === true;
  const shouldWaitForAuth = isLoading && !canOpenOffline;

  // Show loading while checking network/local session state and auth.
  // If we're offline but have a known previous session, don't block on auth refresh.
  if (shouldWaitForAuth || isNetworkLoading || hasAuthenticatedSession === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect based on auth state.
  return isAuthenticated || canOpenOffline ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Redirect href="/auth/login" />
  );
}

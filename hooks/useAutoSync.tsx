import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { ToastAndroid } from "react-native";

const AUTO_SYNC_KEY = "@todo_app:auto_sync";

export function useAutoSync() {
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load preference on mount
  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem(AUTO_SYNC_KEY);
        if (value !== null) {
          setIsAutoSyncEnabled(value === "true");
        }
      } catch (error) {
        console.error("Failed to load auto-sync preference:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const toggleAutoSync = useCallback(async () => {
    try {
      const newValue = !isAutoSyncEnabled;
      console.log("Toggling auto-sync to:", newValue);
      setIsAutoSyncEnabled(newValue);
      await AsyncStorage.setItem(AUTO_SYNC_KEY, String(newValue));

      // Show toast notification
      const message = newValue ? "Auto-Sync enabled" : "Auto-Sync disabled";
      console.log("Showing toast:", message);
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } catch (error) {
      console.error("Failed to save auto-sync preference:", error);
      ToastAndroid.show(
        "Failed to update auto-sync setting",
        ToastAndroid.SHORT,
      );
      // Revert on error
      setIsAutoSyncEnabled(!isAutoSyncEnabled);
    }
  }, [isAutoSyncEnabled]);

  return {
    isAutoSyncEnabled,
    isLoading,
    toggleAutoSync,
  };
}

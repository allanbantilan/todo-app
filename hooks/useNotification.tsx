import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import { Alert, Linking } from "react-native";

// How notifications are presented when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check the current permission status and sync the toggle
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setIsNotificationsEnabled(status === "granted");
      setIsLoading(false);
    })();
  }, []);

  const handleToggle = useCallback(async () => {
    if (isNotificationsEnabled) {
      // Turning OFF — OS doesn't allow programmatic revocation,
      // so we guide the user to Settings instead.
      Alert.alert(
        "Turn Off Notifications",
        "To disable notifications, please go to your device Settings and turn them off for this app.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
          },
        ],
      );
      return;
    }

    // Turning ON — request permission
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    // If previously denied, the OS won't show the prompt again — send to Settings
    if (existingStatus === "denied") {
      Alert.alert(
        "Enable Notifications",
        "Notifications were previously denied. Please enable them in your device Settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
          },
        ],
      );
      return;
    }

    // First-time request — the OS will show its native permission dialog
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });

    if (status === "granted") {
      setIsNotificationsEnabled(true);

      // Optional: fire a test notification so the user sees it working
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Notifications enabled! 🔔",
          body: "You'll now receive notifications from this app.",
        },
        trigger: null, // null = show immediately
      });
    } else {
      // User tapped "Don't Allow"
      setIsNotificationsEnabled(false);
    }
  }, [isNotificationsEnabled]);

  return {
    isNotificationsEnabled,
    isLoading,
    handleToggle,
  };
}

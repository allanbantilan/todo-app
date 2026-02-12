import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import { Alert, Linking } from "react-native";

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

// How notifications are presented when the app is in the foreground
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  // Silently fail in Expo Go
  console.warn("Notifications not available in Expo Go");
}

export function useNotifications() {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check the current permission status and sync the toggle
  useEffect(() => {
    (async () => {
      try {
        if (isExpoGo) {
          // Notifications not available in Expo Go
          setIsNotificationsEnabled(false);
          setIsLoading(false);
          return;
        }
        const { status } = await Notifications.getPermissionsAsync();
        setIsNotificationsEnabled(status === "granted");
      } catch (error) {
        console.warn("Error checking notification permissions:", error);
        setIsNotificationsEnabled(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleToggle = useCallback(async () => {
    if (isExpoGo) {
      Alert.alert(
        "Notifications Unavailable",
        "Push notifications are not supported in Expo Go. Please use a development build to enable notifications.\n\nLearn more at: https://docs.expo.dev/develop/development-builds/introduction/",
        [{ text: "OK" }],
      );
      return;
    }

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
    try {
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
    } catch (error) {
      console.warn("Error toggling notifications:", error);
      Alert.alert("Error", "Failed to toggle notifications. Please try again.");
    }
  }, [isNotificationsEnabled]);

  return {
    isNotificationsEnabled,
    isLoading,
    handleToggle,
  };
}

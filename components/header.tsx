import { createHomeStyles } from "@/assets/styles/home.styles";
import { useSyncStatus } from "@/contexts/SyncContext";
import { TodoItem } from "@/hooks/useOfflineTodos";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

type HeaderProps = {
  todos: TodoItem[];
  isAutoSyncEnabled: boolean;
  hasPendingChanges: boolean;
  onManualSync: () => void;
};

const Header: React.FC<HeaderProps> = ({
  todos,
  isAutoSyncEnabled,
  hasPendingChanges,
  onManualSync,
}) => {
  const { colors } = useTheme();
  const homeStyles = createHomeStyles(colors);
  const { syncStatus, hasUnsyncedChanges } = useSyncStatus();
  const { isOnline } = useNetworkStatus();

  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (syncStatus === "syncing") {
      // Start spinning animation
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [syncStatus, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const completedCount = todos.filter((todo) => todo.isCompleted).length;
  const totalCount = todos.length;

  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const showManualSyncButton =
    isOnline && !isAutoSyncEnabled && hasPendingChanges;

  // Determine sync status text
  const getSyncStatusText = () => {
    if (!isOnline) return null;

    // Check for unsynced changes first
    if (
      hasUnsyncedChanges &&
      (syncStatus === "idle" || syncStatus === "error")
    ) {
      return "Unsynced data";
    }

    switch (syncStatus) {
      case "syncing":
        return "Syncing...";
      case "synced":
        return "All synced";
      case "error":
        return "Sync failed";
      case "idle":
        return "All synced"; // Idle means everything is synced
      default:
        return null;
    }
  };

  const syncStatusText = getSyncStatusText();

  return (
    <View style={homeStyles.header}>
      <View style={homeStyles.titleContainer}>
        <LinearGradient
          colors={colors.gradients.primary}
          style={homeStyles.iconContainer}
        >
          <Ionicons name="flash-outline" size={28} color="#fff" />
        </LinearGradient>

        <View style={homeStyles.titleTextContainer}>
          <Text style={homeStyles.title}>Today&apos;s Tasks</Text>
          <Text
            style={homeStyles.subtitle}
          >{`${completedCount} of ${totalCount} completed`}</Text>
        </View>

        {/* Network & Sync Status Indicator */}
        <View
          style={{
            marginLeft: "auto",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          {!isOnline ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Ionicons
                name="cloud-offline"
                size={16}
                color={colors.textMuted}
              />
              <Text style={{ fontSize: 12, color: colors.textMuted }}>
                Offline
              </Text>
            </View>
          ) : (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              {showManualSyncButton && (
                <TouchableOpacity
                  onPress={onManualSync}
                  disabled={syncStatus === "syncing"}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginRight: 2,
                  }}
                >
                  <Ionicons
                    name="sync"
                    size={14}
                    color={colors.primary}
                  />
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "600",
                      color: colors.primary,
                    }}
                  >
                    Sync
                  </Text>
                </TouchableOpacity>
              )}

              {/* Sync Status Icon */}
              {syncStatus === "syncing" && (
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Ionicons name="sync" size={18} color={colors.primary} />
                </Animated.View>
              )}
              {syncStatus === "synced" && (
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={colors.success}
                />
              )}
              {syncStatus === "error" && (
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
              )}
              {syncStatus === "idle" && !hasUnsyncedChanges && (
                <Ionicons name="cloud-done" size={18} color={colors.success} />
              )}
              {syncStatus === "idle" && hasUnsyncedChanges && (
                <Ionicons name="warning" size={18} color={colors.warning} />
              )}

              {/* Sync Status Text */}
              {syncStatusText && (
                <Text
                  style={{
                    fontSize: 11,
                    color:
                      syncStatus === "syncing"
                        ? colors.primary
                        : syncStatus === "error"
                          ? colors.danger
                          : hasUnsyncedChanges
                            ? colors.warning
                            : colors.success,
                    fontWeight: "500",
                  }}
                >
                  {syncStatusText}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* progress bar */}
      {totalCount > 0 && (
        <View style={homeStyles.progressContainer}>
          <View style={homeStyles.progressBarContainer}>
            {/* Progress Bar */}
            <View style={{ flex: 1 }}>
              <View style={homeStyles.progressBar}>
                <LinearGradient
                  colors={colors.gradients.primary}
                  style={[
                    homeStyles.progressFill,
                    { width: `${progressPercentage}%` },
                  ]}
                />
              </View>
            </View>

            {/* Percentage Text */}
            <Text style={homeStyles.progressText}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default Header;

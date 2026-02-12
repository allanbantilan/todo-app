import { createSettingsStyles } from "@/assets/styles/settings.styles";
import { useAutoSync } from "@/hooks/useAutoSync";
import { useNotifications } from "@/hooks/useNotification";
import useTheme from "@/hooks/useTheme";
import { useTodoNotification } from "@/hooks/Usetodonotification";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Switch, Text, View } from "react-native";

const Preferences = () => {
  const {
    isAutoSyncEnabled,
    isLoading: isAutoSyncLoading,
    toggleAutoSync,
  } = useAutoSync();
  const {
    isNotificationsEnabled,
    isLoading: isNotificationsLoading,
    handleToggle,
  } = useNotifications();

  useTodoNotification(isNotificationsEnabled);

  const { colors, isDarkMode, toggleDarkMode } = useTheme();

  const settingsStyles = createSettingsStyles(colors);

  return (
    <LinearGradient
      colors={colors.gradients.background}
      style={settingsStyles.section}
    >
      <Text style={settingsStyles.sectionTitle}>Preferences</Text>

      {/* DARK MODE */}
      <View style={settingsStyles.settingItem}>
        <View style={settingsStyles.settingLeft}>
          <LinearGradient
            colors={colors.gradients.primary}
            style={settingsStyles.settingIcon}
          >
            <Ionicons name="moon" size={20} color="#fff" />
          </LinearGradient>
          <Text style={settingsStyles.settingText}>Dark Mode</Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          thumbColor={"#fff"}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>

      {/* NOTIFICATION  */}
      <View style={settingsStyles.settingItem}>
        <View style={settingsStyles.settingLeft}>
          <LinearGradient
            colors={colors.gradients.warning}
            style={settingsStyles.settingIcon}
          >
            <Ionicons name="notifications" size={20} color="#fff" />
          </LinearGradient>
          <Text style={settingsStyles.settingText}>Notifications</Text>
        </View>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={handleToggle}
          disabled={isNotificationsLoading}
          thumbColor={"#fff"}
          trackColor={{ false: colors.border, true: colors.warning }}
        />
      </View>

      {/* AUTO-SYNC */}
      <View style={settingsStyles.settingItem}>
        <View style={settingsStyles.settingLeft}>
          <LinearGradient
            colors={colors.gradients.success}
            style={settingsStyles.settingIcon}
          >
            <Ionicons name="sync" size={20} color="#fff" />
          </LinearGradient>
          <Text style={settingsStyles.settingText}>Auto-Sync</Text>
        </View>
        <Switch
          value={isAutoSyncEnabled}
          onValueChange={toggleAutoSync}
          disabled={isAutoSyncLoading}
          thumbColor={"#fff"}
          trackColor={{ false: colors.border, true: colors.success }}
        />
      </View>
    </LinearGradient>
  );
};

export default Preferences;

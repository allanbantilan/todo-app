import { createSettingsStyles } from "@/assets/styles/settings.styles";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

const VersionSection = () => {
  const { colors } = useTheme();
  const settingsStyles = createSettingsStyles(colors);
  const appVersion = Constants.expoConfig?.version ?? "Unknown";

  return (
    <LinearGradient
      colors={colors.gradients.surface}
      style={settingsStyles.section}
    >
      <Text style={settingsStyles.sectionTitle}>Version</Text>

      <View style={[settingsStyles.settingItem, { paddingTop: 4 }]}>
        <View style={settingsStyles.settingLeft}>
          <LinearGradient
            colors={colors.gradients.muted}
            style={settingsStyles.settingIcon}
          >
            <Ionicons name="information-circle" size={20} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={settingsStyles.settingText}>App Version</Text>
            <Text style={{ color: colors.textMuted, marginTop: 2 }}>
              {appVersion}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default VersionSection;
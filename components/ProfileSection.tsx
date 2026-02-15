import { createSettingsStyles } from "@/assets/styles/settings.styles";
import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

const ProfileSection = () => {
  const { colors } = useTheme();
  const settingsStyles = createSettingsStyles(colors);
  const user = useQuery(api.auth.currentUser);

  const nameText = user === undefined ? "Loading..." : user?.name || "Not set";
  const emailText = user === undefined ? "Loading..." : user?.email || "Not available";

  return (
    <LinearGradient
      colors={colors.gradients.surface}
      style={settingsStyles.section}
    >
      <Text style={settingsStyles.sectionTitle}>Profile</Text>

      <View style={[settingsStyles.settingItem, { paddingTop: 4 }]}>
        <View style={settingsStyles.settingLeft}>
          <LinearGradient
            colors={colors.gradients.primary}
            style={settingsStyles.settingIcon}
          >
            <Ionicons name="person" size={20} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={settingsStyles.settingText}>{nameText}</Text>
            <Text style={{ color: colors.textMuted, marginTop: 2 }}>{emailText}</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default ProfileSection;

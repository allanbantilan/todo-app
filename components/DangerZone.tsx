import { createSettingsStyles } from "@/assets/styles/settings.styles";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Alert, Text, TouchableOpacity, View } from "react-native";

const DangerZone = () => {
  const { colors } = useTheme();
  const settingsStyles = createSettingsStyles(colors);
  const { signOut } = useAuth();
  const router = useRouter();

  const clearAllTodos = useMutation(api.todos.clearAllTodos);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/auth/login" as any);
          } catch (error) {
            Alert.alert("Error", "Failed to sign out. Please try again.");
            console.error(error);
          }
        },
      },
    ]);
  };

  const handleClearTodos = () => {
    Alert.alert(
      "Clear All Todos",
      "Are you sure you want to clear all todos? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await clearAllTodos();
              Alert.alert(
                "Success",
                `Successfully deleted ${result.deletedCount} todo${result.deletedCount !== 1 ? "s" : ""}.`,
              );
            } catch (error) {
              Alert.alert("Error", "Failed to clear todos. Please try again.");
              console.error(error);
            }
          },
        },
      ],
    );
  };

  return (
    <LinearGradient
      colors={colors.gradients.surface}
      style={settingsStyles.section}
    >
      <Text style={settingsStyles.sectionTitle}>Danger Zone</Text>

      <TouchableOpacity
        style={[settingsStyles.actionButton]}
        onPress={handleSignOut}
        activeOpacity={0.7}
      >
        <View style={settingsStyles.actionLeft}>
          <LinearGradient
            colors={colors.gradients.warning}
            style={settingsStyles.actionIcon}
          >
            <Ionicons name="log-out" size={18} color="#ffffff" />
          </LinearGradient>
          <Text style={settingsStyles.actionTextDanger}>Sign Out</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[settingsStyles.actionButton, { borderBottomWidth: 0 }]}
        onPress={handleClearTodos}
        activeOpacity={0.7}
      >
        <View style={settingsStyles.actionLeft}>
          <LinearGradient
            colors={colors.gradients.danger}
            style={settingsStyles.actionIcon}
          >
            <Ionicons name="trash" size={18} color="#ffffff" />
          </LinearGradient>
          <Text style={settingsStyles.actionTextDanger}>Clear All Todos</Text>
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default DangerZone;

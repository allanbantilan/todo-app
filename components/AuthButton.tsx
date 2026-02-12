import { createAuthStyles } from "@/assets/styles/auth.styles";
import useTheme from "@/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function AuthButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: AuthButtonProps) {
  const { colors } = useTheme();
  const authStyles = createAuthStyles(colors);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={authStyles.buttonContainer}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          authStyles.button,
          (disabled || loading) && authStyles.buttonDisabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={authStyles.buttonText}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

import { createAuthStyles } from "@/assets/styles/auth.styles";
import useTheme from "@/hooks/useTheme";
import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, ...props }: AuthInputProps) {
  const { colors } = useTheme();
  const authStyles = createAuthStyles(colors);

  return (
    <View style={authStyles.inputWrapper}>
      <Text style={authStyles.inputLabel}>{label}</Text>
      <View style={[authStyles.inputContainer, error && authStyles.inputError]}>
        <TextInput
          style={authStyles.input}
          placeholderTextColor={colors.textMuted}
          {...props}
        />
      </View>
      <Text style={authStyles.errorText}>{error || " "}</Text>
    </View>
  );
}

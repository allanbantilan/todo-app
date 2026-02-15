import { createAuthStyles } from "@/assets/styles/auth.styles";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
  reserveErrorSpace?: boolean;
}

export function AuthInput({
  label,
  error,
  reserveErrorSpace = true,
  secureTextEntry: secureTextEntryProp,
  ...props
}: AuthInputProps) {
  const { colors } = useTheme();
  const authStyles = createAuthStyles(colors);
  const isPasswordField = Boolean(secureTextEntryProp);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={authStyles.inputWrapper}>
      <Text style={authStyles.inputLabel}>{label}</Text>
      <View style={[authStyles.inputContainer, error && authStyles.inputError]}>
        <View style={authStyles.inputInner}>
          <TextInput
            style={[authStyles.input, isPasswordField && authStyles.inputWithAction]}
            placeholderTextColor={colors.textMuted}
            secureTextEntry={isPasswordField ? !isPasswordVisible : secureTextEntryProp}
            {...props}
          />
          {isPasswordField ? (
            <TouchableOpacity
              style={authStyles.inputAction}
              onPress={() => setIsPasswordVisible((prev) => !prev)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off" : "eye"}
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      {reserveErrorSpace || error ? (
        <Text style={authStyles.errorText}>{error || " "}</Text>
      ) : null}
    </View>
  );
}
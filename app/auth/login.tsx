import { createAuthStyles } from "@/assets/styles/auth.styles";
import { AuthButton } from "@/components/AuthButton";
import { AuthInput } from "@/components/AuthInput";
import { AppAuthError, useAuth } from "@/contexts/AuthContext";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { colors } = useTheme();
  const authStyles = createAuthStyles(colors);
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    // Password validation (login only requires a password)
    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setErrors({ email: "", password: "" });
    setLoading(true);
    try {
      console.log("Attempting login with email:", email.trim());
      await signIn(email.trim(), password);
      console.log("Login successful, navigating to tabs");
      router.replace("/(tabs)");
    } catch (error: unknown) {
      console.error("Login error:", error);

      if (error instanceof AppAuthError) {
        switch (error.code) {
          case "INVALID_CREDENTIALS":
            setErrors((prev) => ({ ...prev, password: "Incorrect password" }));
            Alert.alert("Login Failed", "Incorrect email or password.");
            return;
          case "USER_NOT_FOUND":
            setErrors((prev) => ({
              ...prev,
              email: "No account found with this email",
            }));
            Alert.alert("Login Failed", "No account found for this email.");
            return;
          case "RATE_LIMITED":
            Alert.alert(
              "Too Many Attempts",
              "Too many login attempts. Please try again in a moment.",
            );
            return;
          default:
            Alert.alert(
              "Login Failed",
              "Unable to sign in. Please check your email and password.",
            );
            return;
        }
      }

      Alert.alert("Login Failed", "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.container}>
      <SystemBars style={colors.statusBarStyle} />
      <SafeAreaView style={authStyles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={authStyles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets
            contentInsetAdjustmentBehavior="always"
          >
            <View style={authStyles.logoContainer}>
              <LinearGradient
                colors={colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={authStyles.iconWrapper}
              >
                <Ionicons name="checkmark-circle" size={40} color="#FFFFFF" />
              </LinearGradient>
              <Text style={authStyles.appTitle}>Welcome Back!</Text>
              <Text style={authStyles.appSubtitle}>
                Sign in to access your todos
              </Text>
            </View>

            <View style={authStyles.formContainer}>
              <AuthInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
              />

              <AuthInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors((prev) => ({ ...prev, password: "" }));
                }}
                error={errors.password}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
              />

              <AuthButton
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
              />
            </View>

            <View style={authStyles.linkContainer}>
              <Text style={authStyles.linkText}>Don't have an account?</Text>
              <TouchableOpacity
                style={authStyles.linkButton}
                onPress={() => router.push("/auth/register" as any)}
              >
                <Text style={authStyles.linkButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

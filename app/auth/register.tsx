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

export default function RegisterScreen() {
  const { colors } = useTheme();
  const authStyles = createAuthStyles(colors);
  const router = useRouter();
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", email: "", password: "", confirmPassword: "" };

    if (!name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain an uppercase letter";
      isValid = false;
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = "Password must contain a lowercase letter";
      isValid = false;
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain a number";
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setErrors({ name: "", email: "", password: "", confirmPassword: "" });
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
      router.replace("/(tabs)");
    } catch (error: unknown) {
      if (error instanceof AppAuthError) {
        switch (error.code) {
          case "EMAIL_IN_USE":
            setErrors((prev) => ({ ...prev, email: "Email is already in use" }));
            Alert.alert(
              "Registration Failed",
              "This email is already in use. Try signing in instead.",
            );
            return;
          case "INVALID_EMAIL":
            setErrors((prev) => ({ ...prev, email: "Please enter a valid email" }));
            Alert.alert("Registration Failed", "Please enter a valid email address.");
            return;
          case "WEAK_PASSWORD":
            setErrors((prev) => ({
              ...prev,
              password: "Use 8+ chars with uppercase, lowercase, and a number",
            }));
            Alert.alert(
              "Registration Failed",
              "Password does not meet requirements. Use 8+ chars with uppercase, lowercase, and a number.",
            );
            return;
          case "RATE_LIMITED":
            Alert.alert(
              "Too Many Attempts",
              "Too many registration attempts. Please try again shortly.",
            );
            return;
          default:
            Alert.alert("Registration Failed", "Unable to create account. Please try again.");
            return;
        }
      }

      Alert.alert("Registration Failed", "Unable to create account. Please try again.");
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
                colors={colors.gradients.success}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={authStyles.iconWrapper}
              >
                <Ionicons name="person-add" size={40} color="#FFFFFF" />
              </LinearGradient>
              <Text style={authStyles.appTitle}>Create Account</Text>
              <Text style={authStyles.appSubtitle}>
                Sign up to start managing your todos
              </Text>
            </View>

            <View style={authStyles.formContainer}>
              <AuthInput
                label="Name"
                placeholder="Enter your name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
                error={errors.name}
                autoCapitalize="words"
                textContentType="name"
              />

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
                label="Create Password"
                placeholder="Create a password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors((prev) => ({ ...prev, password: "" }));
                }}
                error={errors.password}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                textContentType="newPassword"
                reserveErrorSpace={false}
              />
              {!errors.password && (
                <Text style={authStyles.hintText}>
                  Use 8+ characters with uppercase, lowercase, and a number
                </Text>
              )}

              <AuthInput
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                error={errors.confirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                textContentType="newPassword"
              />

              <AuthButton
                title="Sign Up"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
              />
            </View>

            <View style={authStyles.linkContainer}>
              <Text style={authStyles.linkText}>Already have an account?</Text>
              <TouchableOpacity
                style={authStyles.linkButton}
                onPress={() => router.back()}
              >
                <Text style={authStyles.linkButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

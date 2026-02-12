import { createAuthStyles } from "@/assets/styles/auth.styles";
import { AuthButton } from "@/components/AuthButton";
import { AuthInput } from "@/components/AuthInput";
import { useAuth } from "@/contexts/AuthContext";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

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

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting login with email:", email.trim());
      await signIn(email.trim(), password);
      console.log("Login successful, navigating to tabs");
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Failed",
        error.message || "Invalid email or password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.container}>
      <SafeAreaView style={authStyles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={authStyles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
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
                  setErrors({ ...errors, email: "" });
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
                  setErrors({ ...errors, password: "" });
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

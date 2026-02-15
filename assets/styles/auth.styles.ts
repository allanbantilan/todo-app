import { ColorScheme } from "@/hooks/useTheme";
import { StyleSheet } from "react-native";

export const createAuthStyles = (colors: ColorScheme) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "flex-start",
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 40,
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 48,
    },
    iconWrapper: {
      width: 80,
      height: 80,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    appTitle: {
      fontSize: 28,
      fontWeight: "700",
      letterSpacing: -0.5,
      color: colors.text,
      marginBottom: 8,
    },
    appSubtitle: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.textMuted,
    },
    formContainer: {
      marginBottom: 24,
    },
    inputWrapper: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
      marginLeft: 4,
    },
    inputContainer: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "transparent",
      backgroundColor: colors.surface,
      overflow: "hidden",
    },
    inputInner: {
      flexDirection: "row",
      alignItems: "center",
    },
    input: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      fontSize: 16,
      color: colors.text,
      backgroundColor: "transparent",
      flex: 1,
    },
    inputWithAction: {
      paddingRight: 8,
    },
    inputAction: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    inputError: {
      borderColor: colors.danger,
    },
    errorText: {
      fontSize: 13,
      color: colors.danger,
      marginTop: 6,
      marginLeft: 4,
      minHeight: 18,
      lineHeight: 18,
    },
    hintText: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
      marginBottom: 8,
      marginLeft: 4,
      lineHeight: 16,
    },
    buttonContainer: {
      marginTop: 8,
      marginBottom: 24,
    },
    button: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonText: {
      fontSize: 17,
      fontWeight: "700",
      color: "#FFFFFF",
      letterSpacing: 0.3,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 24,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textMuted,
      marginHorizontal: 16,
    },
    linkContainer: {
      alignItems: "center",
      marginTop: 16,
    },
    linkText: {
      fontSize: 15,
      color: colors.textMuted,
      marginBottom: 4,
    },
    linkButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    linkButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.primary,
    },
    loadingContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return styles;
};
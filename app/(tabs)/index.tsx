import { createHomeStyles } from "@/assets/images/styles/home.styles";
import Header from "@/components/header";
import useTheme from "@/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { toggleDarkMode, colors } = useTheme();
  const homeStyles = createHomeStyles(colors);

  return (
    <LinearGradient
      colors={colors.gradients.background}
      style={homeStyles.container}
    >
      <StatusBar style={colors.statusBarStyle} />

      <SafeAreaView style={homeStyles.safeArea}>
        <Header />

        <TouchableOpacity onPress={toggleDarkMode}>
          <Text>Toggle dark mode</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

import { createHomeStyles } from "@/assets/images/styles/home.styles";
import Header from "@/components/Header";
import TodoInput from "@/components/TodoInput";
import useTheme from "@/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity } from "react-native";
import { SystemBars } from "react-native-edge-to-edge"; // Replace expo-status-bar
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { toggleDarkMode, colors } = useTheme();
  const homeStyles = createHomeStyles(colors);

  return (
    <LinearGradient
      colors={colors.gradients.background}
      style={homeStyles.container}
    >
      <SystemBars style={colors.statusBarStyle} />
      <SafeAreaView
        style={homeStyles.safeArea}
        edges={["top", "left", "right"]}
      >
        <Header />

        <TodoInput />

        <TouchableOpacity onPress={toggleDarkMode}>
          <Text>Toggle dark mode</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

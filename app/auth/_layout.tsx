import useTheme from "@/hooks/useTheme";
import { MaterialTopTabs } from "../(tabs)/_layout";

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <MaterialTopTabs
      initialRouteName="login"
      screenOptions={{
        tabBarStyle: {
          display: "none",
        },
        swipeEnabled: false,
        animationEnabled: true,
        sceneStyle: {
          backgroundColor: colors.bg,
        },
      }}
    >
      <MaterialTopTabs.Screen
        name="login"
        options={{
          title: "Sign In",
        }}
      />
      <MaterialTopTabs.Screen
        name="register"
        options={{
          title: "Sign Up",
        }}
      />
    </MaterialTopTabs>
  );
}

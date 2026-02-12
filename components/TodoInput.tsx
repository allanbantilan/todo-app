import { createHomeStyles } from "@/assets/styles/home.styles";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity, View } from "react-native";

interface TodoInputProps {
  onOpenModal: () => void;
}

const TodoInput: React.FC<TodoInputProps> = ({ onOpenModal }) => {
  const { colors } = useTheme();
  const homeStyles = createHomeStyles(colors);

  return (
    <View style={homeStyles.inputSection}>
      <TouchableOpacity
        onPress={onOpenModal}
        activeOpacity={0.8}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          style={homeStyles.addTodoButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="add-circle" size={24} color="#ffffff" />
          <Text style={homeStyles.addTodoButtonText}>Add New Todo</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default TodoInput;

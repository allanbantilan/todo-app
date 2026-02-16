import { createHomeStyles } from "@/assets/styles/home.styles";
import { TodoItem } from "@/hooks/useOfflineTodos";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native";

type ToggleTodoProps = {
  item: TodoItem;
  homeStyles: ReturnType<typeof createHomeStyles>;
  colors: ReturnType<typeof useTheme>["colors"];
  handleToggleTodo: (id: string, isCompleted: boolean) => void;
  isEditing: boolean;
};

const ToggleTodo: React.FC<ToggleTodoProps> = ({
  item,
  homeStyles,
  colors,
  handleToggleTodo,
  isEditing,
}) => {
  return (
    <TouchableOpacity
      style={homeStyles.checkbox}
      activeOpacity={0.7}
      onPress={() => handleToggleTodo(item._id, item.isCompleted)}
      disabled={isEditing}
    >
      <LinearGradient
        colors={
          item.isCompleted ? colors.gradients.success : colors.gradients.muted
        }
        style={[
          homeStyles.checkboxInner,
          {
            borderColor: item.isCompleted ? "transparent" : colors.border,
          },
        ]}
      >
        {item.isCompleted && (
          <Ionicons name="checkmark" size={18} color="#fff" />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default ToggleTodo;

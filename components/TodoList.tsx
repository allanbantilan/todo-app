import { createHomeStyles } from "@/assets/styles/home.styles";
import { Doc, Id } from "@/convex/_generated/dataModel";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity, View } from "react-native";

type TodoListProps = {
  item: Doc<"todos">;
  homeStyles: ReturnType<typeof createHomeStyles>;
  colors: ReturnType<typeof useTheme>["colors"];
  handleEditTodo: (item: Doc<"todos">) => void;
  handleDeleteTodo: (id: Id<"todos">) => void;
};

const TodoList: React.FC<TodoListProps> = ({
  item,
  homeStyles,
  colors,
  handleEditTodo,
  handleDeleteTodo,
}) => {
  return (
    <View style={homeStyles.todoTextContainer}>
      <Text
        style={[
          homeStyles.todoText,
          item.isCompleted && {
            textDecorationLine: "line-through",
            color: colors.textMuted,
            opacity: 0.6,
          },
        ]}
      >
        {item.text}
      </Text>

      <View style={homeStyles.todoActions}>
        <TouchableOpacity
          onPress={() => handleEditTodo(item)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={colors.gradients.warning}
            style={homeStyles.actionButton}
          >
            <Ionicons name="pencil" size={14} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDeleteTodo(item._id)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={colors.gradients.danger}
            style={homeStyles.actionButton}
          >
            <Ionicons name="trash" size={14} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TodoList;

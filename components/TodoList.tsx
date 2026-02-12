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
  // Provide defaults for optional fields
  const category = item.category || "Personal";
  const priority = item.priority || "Medium";

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return colors.priorityHigh;
      case "Medium":
        return colors.priorityMedium;
      case "Low":
        return colors.priorityLow;
      default:
        return colors.textMuted;
    }
  };

  return (
    <View style={homeStyles.todoContent}>
      {/* Category and Priority Badges */}
      <View style={homeStyles.todoBadges}>
        <View
          style={[homeStyles.categoryBadge, { borderColor: colors.border }]}
        >
          <Ionicons
            name="pricetag"
            size={12}
            color={colors.textMuted}
            style={{ marginRight: 4 }}
          />
          <Text style={homeStyles.categoryBadgeText}>{category}</Text>
        </View>

        <View
          style={[
            homeStyles.priorityBadge,
            { backgroundColor: getPriorityColor(priority) + "20" },
          ]}
        >
          <View
            style={[
              homeStyles.priorityDot,
              { backgroundColor: getPriorityColor(priority) },
            ]}
          />
          <Text
            style={[
              homeStyles.priorityBadgeText,
              { color: getPriorityColor(priority) },
            ]}
          >
            {priority}
          </Text>
        </View>
      </View>

      {/* Todo Text */}
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

      {/* Action Buttons */}
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

import { createHomeStyles } from "@/assets/styles/home.styles";
import AddTodoModal from "@/components/AddTodoModal";
import EditTodoModal from "@/components/EditTodoModal";
import EmptyState from "@/components/EmptyState";
import FilterBar from "@/components/FilterBar";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import TodoList from "@/components/TodoList";
import ToggleTodo from "@/components/ToggleTodo";
import { useSyncStatus } from "@/contexts/SyncContext";
import { api } from "@/convex/_generated/api";
import { useAutoSync } from "@/hooks/useAutoSync";
import { TodoItem, useOfflineTodos } from "@/hooks/useOfflineTodos";
import useTheme from "@/hooks/useTheme";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { SafeAreaView } from "react-native-safe-area-context";

type SortOption = "default" | "highFirst" | "lowFirst";

export default function Index() {
  const { colors } = useTheme();
  const { startSync, finishSync, errorSync } = useSyncStatus();
  const { isAutoSyncEnabled } = useAutoSync();
  const { isOnline } = useNetworkStatus();

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState<SortOption>("default");

  const homeStyles = createHomeStyles(colors);

  const remoteTodos = useQuery(api.todos.getTodos);
  const addTodoRemote = useMutation(api.todos.addTodo);
  const updateTodoRemote = useMutation(api.todos.updateTodo);
  const toggleTodoRemote = useMutation(api.todos.toggleTodo);
  const deleteTodoRemote = useMutation(api.todos.deleteTodo);

  const {
    todos,
    isInitialLoading,
    hasPendingChanges,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    syncPendingChanges,
  } = useOfflineTodos({
    remoteTodos,
    isOnline,
    isAutoSyncEnabled,
    startSync,
    finishSync,
    errorSync,
    addTodoRemote,
    updateTodoRemote,
    toggleTodoRemote,
    deleteTodoRemote,
  });

  // Extract unique categories from todos
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      todos.map((todo) => todo.category || "Personal").filter(Boolean),
    );
    return Array.from(uniqueCategories).sort();
  }, [todos]);

  // Filter and sort todos
  const filteredAndSortedTodos = useMemo(() => {
    // Filter by category
    let filtered = todos;
    if (selectedCategory !== "All") {
      filtered = todos.filter(
        (todo) => (todo.category || "Personal") === selectedCategory,
      );
    }

    // Sort by priority
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    let sorted = [...filtered];

    if (sortOption === "highFirst") {
      sorted.sort((a, b) => {
        const aPriority =
          priorityOrder[
            (a.priority || "Medium") as keyof typeof priorityOrder
          ] || 2;
        const bPriority =
          priorityOrder[
            (b.priority || "Medium") as keyof typeof priorityOrder
          ] || 2;
        return bPriority - aPriority;
      });
    } else if (sortOption === "lowFirst") {
      sorted.sort((a, b) => {
        const aPriority =
          priorityOrder[
            (a.priority || "Medium") as keyof typeof priorityOrder
          ] || 2;
        const bPriority =
          priorityOrder[
            (b.priority || "Medium") as keyof typeof priorityOrder
          ] || 2;
        return aPriority - bPriority;
      });
    }

    return sorted;
  }, [todos, selectedCategory, sortOption]);

  if (isInitialLoading) return <LoadingSpinner />;

  const handleToggleTodo = async (id: string, isCompleted: boolean) => {
    try {
      await toggleTodo(id);

      ToastAndroid.show(
        isCompleted ? "Marked as incomplete" : "Marked as completed",
        ToastAndroid.SHORT,
      );
    } catch (error) {
      Alert.alert("Error", "Failed to toggle todo. Please try again.");
      console.error(error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this todo?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTodo(id);

              ToastAndroid.show("Todo deleted", ToastAndroid.SHORT);
            } catch (error) {
              Alert.alert("Error", "Failed to delete todo. Please try again.");
              console.error(error);
            }
          },
        },
      ],
    );
  };

  const handleEditTodo = (item: TodoItem) => {
    setEditingTodo(item);
    setIsEditModalVisible(true);
  };

  const handleAddTodo = async (input: {
    text: string;
    category: string;
    priority: "High" | "Medium" | "Low";
  }) => {
    await addTodo(input);
  };

  const handleUpdateTodo = async (input: {
    id: string;
    text: string;
    category: string;
    priority: "High" | "Medium" | "Low";
  }) => {
    await updateTodo(input);
  };

  const handleManualSync = async () => {
    await syncPendingChanges();
  };

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

  const renderTodoItem = ({ item }: { item: TodoItem }) => {
    const priority = item.priority || "Medium";

    return (
      <View style={homeStyles.todoItemWrapper}>
        <LinearGradient
          colors={colors.gradients.surface}
          style={homeStyles.todoItem}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Priority Indicator Bar */}
          <View
            style={[
              homeStyles.priorityBar,
              { backgroundColor: getPriorityColor(priority) },
            ]}
          />

          <ToggleTodo
            item={item}
            homeStyles={homeStyles}
            colors={colors}
            handleToggleTodo={handleToggleTodo}
            isEditing={false}
          />

          <View style={homeStyles.todoTextContainer}>
            <TodoList
              item={item}
              homeStyles={homeStyles}
              colors={colors}
              handleEditTodo={handleEditTodo}
              handleDeleteTodo={handleDeleteTodo}
            />
          </View>
        </LinearGradient>
      </View>
    );
  };

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
        <Header
          todos={todos}
          isAutoSyncEnabled={isAutoSyncEnabled}
          hasPendingChanges={hasPendingChanges}
          onManualSync={handleManualSync}
        />

        {/* Add Todo Button Section */}
        <View style={homeStyles.addButtonSection}>
          <TouchableOpacity
            onPress={() => setIsAddModalVisible(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              style={homeStyles.addTodoButtonLarge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add-circle" size={20} color="#ffffff" />
              <Text style={homeStyles.addTodoButtonText}>Add New Todo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {categories.length > 0 && (
          <FilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortOption={sortOption}
            onSortChange={setSortOption}
          />
        )}

        <FlatList
          data={filteredAndSortedTodos}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item._id}
          style={homeStyles.todoList}
          contentContainerStyle={homeStyles.todoListContent}
          ListEmptyComponent={<EmptyState />}
        />

        <AddTodoModal
          visible={isAddModalVisible}
          onClose={() => setIsAddModalVisible(false)}
          onSave={handleAddTodo}
        />

        <EditTodoModal
          visible={isEditModalVisible}
          onClose={() => {
            setIsEditModalVisible(false);
            setEditingTodo(null);
          }}
          todo={editingTodo}
          onSave={handleUpdateTodo}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

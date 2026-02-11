import { createHomeStyles } from "@/assets/styles/home.styles";
import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import IsEditingState from "@/components/IsEditingState";
import LoadingSpinner from "@/components/LoadingSpinner";
import TodoInput from "@/components/TodoInput";
import TodoList from "@/components/TodoList";
import ToggleTodo from "@/components/ToggleTodo";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import useTheme from "@/hooks/useTheme";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  FlatList,
  ToastAndroid,
  View
} from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { SafeAreaView } from "react-native-safe-area-context";

type Todo = Doc<"todos">;

export default function Index() {
  const { toggleDarkMode, colors } = useTheme();

  const [editingId, setEditingId] = useState<Id<"todos"> | null>(null);
  const [editingText, setEditingText] = useState("");

  const homeStyles = createHomeStyles(colors);

  const todos = useQuery(api.todos.getTodos);
  const toggleTodo = useMutation(api.todos.toggleTodo);
  const deleteTodo = useMutation(api.todos.deleteTodo);
  const updateTodo = useMutation(api.todos.updateTodo);

  const isLoading = todos === undefined;

  if (isLoading) return <LoadingSpinner />;

  const handleToggleTodo = async (id: Id<"todos">, isCompleted: boolean) => {
    try {
      await toggleTodo({ id });

      ToastAndroid.show(
        isCompleted ? "Marked as incomplete" : "Marked as completed",
        ToastAndroid.SHORT,
      );
    } catch (error) {
      Alert.alert("Error", "Failed to toggle todo. Please try again.");
      console.error(error);
    }
  };

  const handleDeleteTodo = async (id: Id<"todos">) => {
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
              await deleteTodo({ id });

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

  const handleEditTodo = (item: Todo) => {
    setEditingId(item._id);
    setEditingText(item.text);
  };

  const handleSaveEdit = async () => {
    if (editingId) {
      try {
        await updateTodo({ id: editingId, text: editingText });
        setEditingId(null);
        setEditingText("");
        ToastAndroid.show("Todo updated", ToastAndroid.SHORT);
      } catch (error) {
        Alert.alert("Error", "Failed to update todo. Please try again.");
        console.error(error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const renderTodoItem = ({ item }: { item: Todo }) => {
    const isEditing = editingId === item._id;
    return (
      <View style={homeStyles.todoItemWrapper}>
        <LinearGradient
          colors={colors.gradients.surface}
          style={homeStyles.todoItem}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ToggleTodo
            item={item}
            homeStyles={homeStyles}
            colors={colors}
            handleToggleTodo={handleToggleTodo}
            isEditing={isEditing}
          />

          {isEditing ? (
            <IsEditingState
              editingText={editingText}
              setEditingText={setEditingText}
              handleSaveEdit={handleSaveEdit}
              handleCancelEdit={handleCancelEdit}
            />
          ) : (
            <TodoList
              item={item}
              homeStyles={homeStyles}
              colors={colors}
              handleEditTodo={handleEditTodo}
              handleDeleteTodo={handleDeleteTodo}
            />
          )}
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
        <Header />

        <TodoInput />

        <FlatList
          data={todos}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item._id}
          style={homeStyles.todoList}
          contentContainerStyle={homeStyles.todoListContent}
          ListEmptyComponent={<EmptyState />}
          // showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

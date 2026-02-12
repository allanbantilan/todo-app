import { createHomeStyles } from "@/assets/styles/home.styles";
import { useSyncStatus } from "@/contexts/SyncContext";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useAutoSync } from "@/hooks/useAutoSync";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
    Alert,
    Keyboard,
    Modal,
    ScrollView,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View,
} from "react-native";

type Priority = "High" | "Medium" | "Low";

const PREDEFINED_CATEGORIES = [
  "Work",
  "Personal",
  "Shopping",
  "Chores",
  "Activity",
];

interface EditTodoModalProps {
  visible: boolean;
  onClose: () => void;
  todo: Doc<"todos"> | null;
}

const EditTodoModal: React.FC<EditTodoModalProps> = ({
  visible,
  onClose,
  todo,
}) => {
  const { colors } = useTheme();
  const homeStyles = createHomeStyles(colors);
  const { startSync, finishSync, errorSync } = useSyncStatus();
  const { isAutoSyncEnabled } = useAutoSync();

  const [todoText, setTodoText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<Priority>("Medium");

  const updateTodo = useMutation(api.todos.updateTodo);

  // Load todo data when modal opens
  useEffect(() => {
    if (todo && visible) {
      setTodoText(todo.text);
      const category = todo.category || "Personal";
      const priority = (todo.priority || "Medium") as Priority;

      // Check if it's a predefined category
      if (PREDEFINED_CATEGORIES.includes(category)) {
        setSelectedCategory(category);
        setShowCustomCategoryInput(false);
        setCustomCategory("");
      } else {
        setCustomCategory(category);
        setShowCustomCategoryInput(true);
        setSelectedCategory("");
      }

      setSelectedPriority(priority);
    }
  }, [todo, visible]);

  const resetForm = () => {
    setTodoText("");
    setSelectedCategory("");
    setCustomCategory("");
    setShowCustomCategoryInput(false);
    setSelectedPriority("Medium");
  };

  const handleSave = async () => {
    if (!todo) return;

    if (!todoText.trim()) {
      Alert.alert("Error", "Please enter a todo text");
      return;
    }

    const finalCategory = showCustomCategoryInput
      ? customCategory.trim()
      : selectedCategory;

    if (!finalCategory) {
      Alert.alert("Error", "Please select or enter a category");
      return;
    }

    try {
      if (isAutoSyncEnabled) startSync();
      await updateTodo({
        id: todo._id,
        text: todoText.trim(),
        category: finalCategory,
        priority: selectedPriority,
      });
      if (isAutoSyncEnabled) finishSync();

      ToastAndroid.show("Todo updated successfully", ToastAndroid.SHORT);
      resetForm();
      onClose();
      Keyboard.dismiss();
    } catch (error) {
      if (isAutoSyncEnabled) errorSync();
      console.error("Error updating todo:", error);
      Alert.alert("Error", "Failed to update todo. Please try again.");
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
    Keyboard.dismiss();
  };

  const handleCategorySelect = (category: string) => {
    if (category === "Custom") {
      setShowCustomCategoryInput(true);
      setSelectedCategory("");
    } else {
      setSelectedCategory(category);
      setShowCustomCategoryInput(false);
      setCustomCategory("");
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "High":
        return colors.priorityHigh;
      case "Medium":
        return colors.priorityMedium;
      case "Low":
        return colors.priorityLow;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={homeStyles.modalBackdrop}>
        <View style={homeStyles.modalContainer}>
          <LinearGradient
            colors={colors.gradients.surface}
            style={homeStyles.modalContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={homeStyles.modalHeader}>
                <Text style={homeStyles.modalTitle}>Edit Todo</Text>
                <TouchableOpacity
                  onPress={handleCancel}
                  activeOpacity={0.7}
                  style={homeStyles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Todo Text Input */}
              <View style={homeStyles.modalSection}>
                <Text style={homeStyles.modalLabel}>Task Description</Text>
                <TextInput
                  style={homeStyles.modalInput}
                  placeholder="What do you need to do?"
                  value={todoText}
                  onChangeText={setTodoText}
                  multiline
                  placeholderTextColor={colors.textMuted}
                  maxLength={500}
                />
              </View>

              {/* Category Selection */}
              <View style={homeStyles.modalSection}>
                <Text style={homeStyles.modalLabel}>Category</Text>
                <View style={homeStyles.categoryGrid}>
                  {PREDEFINED_CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      onPress={() => handleCategorySelect(category)}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={
                          selectedCategory === category
                            ? colors.gradients.primary
                            : colors.gradients.muted
                        }
                        style={homeStyles.categoryChip}
                      >
                        <Text
                          style={[
                            homeStyles.categoryChipText,
                            selectedCategory === category &&
                              homeStyles.categoryChipTextActive,
                          ]}
                        >
                          {category}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={() => handleCategorySelect("Custom")}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={
                        showCustomCategoryInput
                          ? colors.gradients.primary
                          : colors.gradients.muted
                      }
                      style={homeStyles.categoryChip}
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={16}
                        color={
                          showCustomCategoryInput ? "#ffffff" : colors.textMuted
                        }
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          homeStyles.categoryChipText,
                          showCustomCategoryInput &&
                            homeStyles.categoryChipTextActive,
                        ]}
                      >
                        Custom
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {showCustomCategoryInput && (
                  <TextInput
                    style={[homeStyles.modalInput, { marginTop: 12 }]}
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChangeText={setCustomCategory}
                    placeholderTextColor={colors.textMuted}
                    maxLength={50}
                  />
                )}
              </View>

              {/* Priority Selection */}
              <View style={homeStyles.modalSection}>
                <Text style={homeStyles.modalLabel}>Priority</Text>
                <View style={homeStyles.priorityContainer}>
                  {(["High", "Medium", "Low"] as Priority[]).map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      onPress={() => setSelectedPriority(priority)}
                      activeOpacity={0.7}
                      style={{ flex: 1 }}
                    >
                      <LinearGradient
                        colors={
                          selectedPriority === priority
                            ? [
                                getPriorityColor(priority),
                                getPriorityColor(priority),
                              ]
                            : colors.gradients.muted
                        }
                        style={homeStyles.priorityButton}
                      >
                        <View
                          style={[
                            homeStyles.priorityIndicator,
                            { backgroundColor: getPriorityColor(priority) },
                            selectedPriority === priority &&
                              homeStyles.priorityIndicatorActive,
                          ]}
                        />
                        <Text
                          style={[
                            homeStyles.priorityButtonText,
                            selectedPriority === priority &&
                              homeStyles.priorityButtonTextActive,
                          ]}
                        >
                          {priority}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={homeStyles.modalActions}>
                <TouchableOpacity
                  onPress={handleCancel}
                  activeOpacity={0.7}
                  style={{ flex: 1 }}
                >
                  <LinearGradient
                    colors={colors.gradients.muted}
                    style={homeStyles.modalButton}
                  >
                    <Text style={homeStyles.modalButtonText}>Cancel</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  activeOpacity={0.7}
                  style={{ flex: 1 }}
                >
                  <LinearGradient
                    colors={colors.gradients.success}
                    style={homeStyles.modalButton}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#ffffff"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={homeStyles.modalButtonText}>Save Changes</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

export default EditTodoModal;

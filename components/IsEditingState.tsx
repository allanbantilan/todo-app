import { createHomeStyles } from "@/assets/styles/home.styles";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type props = {
  editingText: string;
  setEditingText: (text: string) => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
};

const IsEditingState = ({
  editingText,
  setEditingText,
  handleSaveEdit,
  handleCancelEdit,
}: props) => {
  const { colors } = useTheme();
  const homeStyles = createHomeStyles(colors);

  return (
    <View style={homeStyles.editContainer}>
      <TextInput
        style={homeStyles.editInput}
        value={editingText}
        onChangeText={setEditingText}
        autoFocus
        multiline
        placeholder="Edit task..."
        placeholderTextColor={colors.textMuted}
      />

      <View style={homeStyles.editButtons}>
        <TouchableOpacity onPress={handleSaveEdit} activeOpacity={0.8}>
          <LinearGradient
            colors={colors.gradients.success}
            style={homeStyles.editButton}
          >
            <Ionicons name="checkmark" size={14} color="#fff" />
            <Text style={homeStyles.editButtonText}>Save</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCancelEdit} activeOpacity={0.8}>
          <LinearGradient
            colors={colors.gradients.muted}
            style={homeStyles.editButton}
          >
            <Ionicons name="close" size={14} color="#fff" />
            <Text style={homeStyles.editButtonText}>Cancel</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default IsEditingState;

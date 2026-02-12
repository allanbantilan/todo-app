import { createHomeStyles } from "@/assets/styles/home.styles";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

type SortOption = "default" | "highFirst" | "lowFirst";

interface FilterBarProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  sortOption,
  onSortChange,
}) => {
  const { colors } = useTheme();
  const homeStyles = createHomeStyles(colors);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  const getSortIcon = (option: SortOption) => {
    switch (option) {
      case "highFirst":
        return "arrow-up-circle";
      case "lowFirst":
        return "arrow-down-circle";
      default:
        return "swap-vertical";
    }
  };

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case "highFirst":
        return "High First";
      case "lowFirst":
        return "Low First";
      default:
        return "Default";
    }
  };

  const allCategories = ["All", ...categories];

  return (
    <View style={homeStyles.filterBarCompact}>
      {/* Category Dropdown */}
      <TouchableOpacity
        onPress={() => setShowCategoryModal(true)}
        activeOpacity={0.7}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={colors.gradients.surface}
          style={homeStyles.dropdownButton}
        >
          <View style={homeStyles.dropdownContent}>
            <View style={homeStyles.dropdownLabel}>
              <Ionicons name="pricetag" size={16} color={colors.primary} />
              <Text style={homeStyles.dropdownLabelText}>Category</Text>
            </View>
            <View style={homeStyles.dropdownValue}>
              <Text style={homeStyles.dropdownValueText} numberOfLines={1}>
                {selectedCategory}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.textMuted}
              />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Sort Dropdown */}
      <TouchableOpacity
        onPress={() => setShowSortModal(true)}
        activeOpacity={0.7}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={colors.gradients.surface}
          style={homeStyles.dropdownButton}
        >
          <View style={homeStyles.dropdownContent}>
            <View style={homeStyles.dropdownLabel}>
              <Ionicons
                name={getSortIcon(sortOption) as any}
                size={16}
                color={colors.primary}
              />
              <Text style={homeStyles.dropdownLabelText}>Sort</Text>
            </View>
            <View style={homeStyles.dropdownValue}>
              <Text style={homeStyles.dropdownValueText} numberOfLines={1}>
                {getSortLabel(sortOption)}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.textMuted}
              />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity
          style={homeStyles.dropdownModalBackdrop}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={homeStyles.dropdownModalContent}>
            <LinearGradient
              colors={colors.gradients.surface}
              style={homeStyles.dropdownModalInner}
            >
              <Text style={homeStyles.dropdownModalTitle}>Select Category</Text>
              <ScrollView style={homeStyles.dropdownModalList}>
                {allCategories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => {
                      onCategoryChange(category);
                      setShowCategoryModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        homeStyles.dropdownModalItem,
                        selectedCategory === category &&
                          homeStyles.dropdownModalItemActive,
                      ]}
                    >
                      <Ionicons
                        name={category === "All" ? "list" : "pricetag"}
                        size={18}
                        color={
                          selectedCategory === category
                            ? colors.primary
                            : colors.textMuted
                        }
                      />
                      <Text
                        style={[
                          homeStyles.dropdownModalItemText,
                          selectedCategory === category &&
                            homeStyles.dropdownModalItemTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                      {selectedCategory === category && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={colors.primary}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={homeStyles.dropdownModalBackdrop}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={homeStyles.dropdownModalContent}>
            <LinearGradient
              colors={colors.gradients.surface}
              style={homeStyles.dropdownModalInner}
            >
              <Text style={homeStyles.dropdownModalTitle}>
                Sort By Priority
              </Text>
              <ScrollView style={homeStyles.dropdownModalList}>
                {(["default", "highFirst", "lowFirst"] as SortOption[]).map(
                  (option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        onSortChange(option);
                        setShowSortModal(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          homeStyles.dropdownModalItem,
                          sortOption === option &&
                            homeStyles.dropdownModalItemActive,
                        ]}
                      >
                        <Ionicons
                          name={getSortIcon(option) as any}
                          size={18}
                          color={
                            sortOption === option
                              ? colors.primary
                              : colors.textMuted
                          }
                        />
                        <Text
                          style={[
                            homeStyles.dropdownModalItemText,
                            sortOption === option &&
                              homeStyles.dropdownModalItemTextActive,
                          ]}
                        >
                          {getSortLabel(option)}
                        </Text>
                        {sortOption === option && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={colors.primary}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  ),
                )}
              </ScrollView>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default FilterBar;

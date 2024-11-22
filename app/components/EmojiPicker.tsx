import { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Modal,
  View,
  ScrollView,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Colors } from "@/constants/Colors";

const EMOJIS = [
  "💰",
  "💵",
  "💳",
  "🏦",
  "🛒",
  "🛍️",
  "🍽️",
  "🍕",
  "🚗",
  "⛽",
  "🏠",
  "📱",
  "💻",
  "📚",
  "🎮",
  "🎬",
  "🎵",
  "👕",
  "👟",
  "💄",
  "🏥",
  "💊",
  "🚌",
  "✈️",
  "🎁",
  "🎨",
  "⚽",
  "🎯",
  "🔧",
  "📝",
];

interface EmojiPickerProps {
  selected: string;
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ selected, onSelect }: EmojiPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selectedContainer}
        onPress={() => setModalVisible(true)}
      >
        <ThemedText style={styles.selectedEmoji}>{selected}</ThemedText>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Seleccionar Emoji</ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <ThemedText style={styles.closeButton}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.emojiGrid}>
                {EMOJIS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={styles.emojiButton}
                    onPress={() => {
                      onSelect(emoji);
                      setModalVisible(false);
                    }}
                  >
                    <ThemedText style={styles.emoji}>{emoji}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  selectedContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.icon,
  },
  selectedEmoji: {
    fontSize: 32,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.light.icon,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  emojiButton: {
    width: "18%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  emoji: {
    fontSize: 24,
  },
});

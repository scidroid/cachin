import { StyleSheet, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ThemedText } from "./ThemedText";
import { Colors } from "@/constants/Colors";

interface Option {
  label: string;
  value: string;
}

interface FormSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
}

export function FormSelect({
  label,
  value,
  onValueChange,
  options,
}: FormSelectProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View style={styles.selectContainer}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={styles.select}
        >
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: Colors.light.icon,
    borderRadius: 8,
  },
  select: {
    color: Colors.light.text,
  },
});

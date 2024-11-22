import { StyleSheet, ScrollView, SafeAreaView, Platform } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import DateTimePicker from "@react-native-community/datetimepicker";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "../_layout";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { FormButton } from "@/components/FormButton";
import { EmojiPicker } from "@/components/EmojiPicker";

const transactionTypes = [
  { label: "Gasto", value: "expense" },
  { label: "Ingreso", value: "income" },
];

export default function AddTransactionScreen() {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [form, setForm] = useState({
    name: "",
    value: "",
    type: "expense",
    description: "",
    emoji: "💰",
    datetime: new Date(),
  });
  const tabBarHeight = useBottomTabBarHeight();

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setForm((prev) => ({ ...prev, datetime: selectedDate }));
    }
  };

  async function handleSubmit() {
    if (!auth?.username || !form.name || !form.value) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: auth.username,
          name: form.name,
          value: parseFloat(form.value),
          type: form.type,
          description: form.description || null,
          emoji: form.emoji,
          datetime: form.datetime.toISOString(),
        }),
      });

      if (response.ok) {
        router.push("/explore");
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: tabBarHeight + 16 },
        ]}
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Nuevo Movimiento</ThemedText>
        </ThemedView>

        <ThemedView style={styles.form}>
          <EmojiPicker
            selected={form.emoji}
            onSelect={(emoji) => setForm({ ...form, emoji })}
          />

          <FormInput
            label="Nombre"
            value={form.name}
            onChangeText={(name) => setForm({ ...form, name })}
            placeholder="Ej: Almuerzo, Salario, etc."
          />

          <FormInput
            label="Monto"
            value={form.value}
            onChangeText={(value) => setForm({ ...form, value })}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />

          <FormSelect
            label="Tipo"
            value={form.type}
            onValueChange={(type) => setForm({ ...form, type })}
            options={transactionTypes}
          />

          <FormInput
            label="Descripción (opcional)"
            value={form.description}
            onChangeText={(description) => setForm({ ...form, description })}
            placeholder="Agrega detalles adicionales"
            multiline
          />

          <FormInput
            label="Fecha y Hora"
            value={form.datetime.toLocaleString()}
            onPressIn={() => setShowDatePicker(true)}
            showSoftInputOnFocus={false}
            placeholder="Seleccionar fecha y hora"
          />

          {showDatePicker && (
            <DateTimePicker
              value={form.datetime}
              mode="datetime"
              onChange={onDateChange}
              display={Platform.OS === "ios" ? "inline" : "default"}
            />
          )}

          <FormButton
            onPress={handleSubmit}
            disabled={loading || !form.name || !form.value}
            loading={loading}
          >
            Guardar
          </FormButton>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  titleContainer: {
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
});

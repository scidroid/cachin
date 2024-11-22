import { StyleSheet, ScrollView, SafeAreaView } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">¡Bienvenido a Cachín!</ThemedText>
          <HelloWave />
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Tu Compañero Financiero</ThemedText>
          <ThemedText style={styles.description}>
            Cachín es tu asistente personal para manejar tus finanzas de forma
            fácil y divertida. Con Cachín podrás:
          </ThemedText>

          <ThemedView style={styles.featureList}>
            <ThemedText style={styles.feature}>
              💰 Registrar tus ingresos y gastos fácilmente
            </ThemedText>
            <ThemedText style={styles.feature}>
              🤖 Obtener análisis personalizados con IA
            </ThemedText>
            <ThemedText style={styles.feature}>
              🎮 Desbloquear logros mientras mejoras tus finanzas
            </ThemedText>
            <ThemedText style={styles.feature}>
              📊 Visualizar tus patrones de gasto
            </ThemedText>
            <ThemedText style={styles.feature}>
              💡 Recibir consejos personalizados para ahorrar
            </ThemedText>
          </ThemedView>

          <ThemedText style={styles.description}>
            ¡Comienza tu viaje hacia una mejor salud financiera hoy mismo!
          </ThemedText>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  stepContainer: {
    gap: 16,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  featureList: {
    gap: 12,
    paddingLeft: 8,
  },
  feature: {
    fontSize: 16,
    lineHeight: 24,
  },
});

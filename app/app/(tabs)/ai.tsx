import { StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useState } from "react";
import Markdown from "react-native-markdown-display";

import { ExternalLink } from "@/components/ExternalLink";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FormButton } from "@/components/FormButton";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAuth } from "../_layout";
import { Colors } from "@/constants/Colors";

export default function Screen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { username } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const generateAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/transactions/analysis/${username}`
      );
      if (!response.ok) throw new Error("Failed to generate analysis");

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Error generating analysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: tabBarHeight + 16 },
        ]}
      >
        <ThemedView style={styles.header}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Asistente Financiero</ThemedText>
          </ThemedView>

          <ThemedText style={styles.subtitle}>
            Obtén un análisis personalizado de tus finanzas y recomendaciones
            inteligentes para mejorar tu salud financiera.
          </ThemedText>
        </ThemedView>

        {!analysis ? (
          <ThemedView style={styles.emptyState}>
            <IconSymbol
              name="sparkles"
              size={48}
              color={Colors.light.tint}
              style={styles.emptyIcon}
            />
            <ThemedText style={styles.emptyTitle}>
              ¡Descubre tus Insights Financieros!
            </ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Nuestro asistente IA analizará tus transacciones y te
              proporcionará recomendaciones personalizadas para ayudarte a
              alcanzar tus metas financieras.
            </ThemedText>
            <FormButton
              onPress={generateAnalysis}
              loading={isLoading}
              disabled={!username}
            >
              {username ? "Generar Análisis" : "Inicia sesión para continuar"}
            </FormButton>
          </ThemedView>
        ) : (
          <ThemedView style={styles.content}>
            <ThemedView style={styles.analysisContainer}>
              <Markdown style={markdownStyles}>{analysis}</Markdown>
            </ThemedView>

            <FormButton
              onPress={generateAnalysis}
              loading={isLoading}
              disabled={!username}
            >
              Actualizar Análisis
            </FormButton>
          </ThemedView>
        )}

        <ThemedView style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Powered by OpenAI GPT-4
          </ThemedText>
          <ExternalLink style={styles.link} href="https://openai.com">
            Más información
          </ExternalLink>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 16,
    gap: 24,
  },
  header: {
    gap: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  emptyState: {
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  emptyIcon: {
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  content: {
    gap: 16,
  },
  analysisContainer: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
  },
  analysis: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
  },
  footer: {
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#666",
  },
  link: {
    fontSize: 12,
  },
});

const markdownStyles = {
  body: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
  },
  heading1: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 12,
    color: "#444",
  },
  heading2: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#444",
  },
  paragraph: {
    marginVertical: 8,
  },
  list: {
    marginLeft: 20,
  },
  listItem: {
    marginVertical: 4,
  },
  strong: {
    fontWeight: "700",
  },
  em: {
    fontStyle: "italic",
  },
};

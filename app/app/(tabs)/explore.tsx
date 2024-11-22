import {
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import useSWR from "swr";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "../_layout";

interface Transaction {
  id: number;
  username: string;
  value: number;
  type: "expense" | "income";
  name: string;
  description: string | null;
  emoji: string;
  datetime: string;
}

interface Achievement {
  title: string;
  description: string;
  emoji: string;
  isUnlocked: boolean;
}

function getMotivationalMessage(savingsPercentage: number): string {
  if (savingsPercentage >= 50) return "¡Experto financiero! 🌟";
  if (savingsPercentage >= 30) return "¡Excelente ahorro! 🚀";
  if (savingsPercentage >= 20) return "¡Vas muy bien! 💪";
  if (savingsPercentage >= 10) return "¡Buen comienzo! 🌱";
  if (savingsPercentage > 0) return "¡Sigue así! 👊";
  return "¡Comienza a ahorrar! 💫";
}

function calculateLevel(transactions: Transaction[]) {
  if (!transactions.length)
    return { level: 1, progress: 0, points: 0, position: 1 };

  const stats = transactions.reduce(
    (acc, t) => {
      const amount = Math.abs(t.value);
      if (t.type === "expense") {
        acc.totalExpenses += amount;
      } else {
        acc.totalIncome += amount;
      }
      return acc;
    },
    { totalExpenses: 0, totalIncome: 0 }
  );

  const savingsPercentage =
    stats.totalIncome > 0
      ? ((stats.totalIncome - stats.totalExpenses) / stats.totalIncome) * 100
      : 0;

  const points = Math.max(0, Math.round(savingsPercentage * 100) / 100);

  let position;
  if (points > 50) position = 1;
  else if (points > 30) position = 2;
  else if (points > 20) position = 3;
  else if (points > 10) position = 8;
  else position = 15;

  return {
    message: getMotivationalMessage(points),
    progress: (points % 10) / 10,
    points,
    position,
  };
}

function getAchievements(
  transactions: Transaction[],
  balance: number
): Achievement[] {
  return [
    {
      title: "Primeros Pasos",
      description: "Registra tu primera transacción",
      emoji: "🌱",
      isUnlocked: transactions.length >= 1,
    },
    {
      title: "Ahorrador",
      description: "Mantén un balance positivo",
      emoji: "💰",
      isUnlocked: balance > 0,
    },
    {
      title: "Organizado",
      description: "Registra 10 transacciones",
      emoji: "📊",
      isUnlocked: transactions.length >= 10,
    },
    {
      title: "Experto Financiero",
      description: "Alcanza un balance de 1,000,000",
      emoji: "🏆",
      isUnlocked: balance >= 1000000,
    },
  ];
}

const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "COP",
});

export default function Screen() {
  const { username } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const { data: transactions, mutate } = useSWR<Transaction[]>(
    username ? `/api/transactions/${username}` : null,
    async (url: string) => {
      const response = await fetch(`http://localhost:3000${url}`);
      return response.json();
    }
  );

  const stats = transactions?.reduce(
    (acc, transaction) => {
      const amount = Math.abs(transaction.value);
      if (transaction.type === "expense") {
        acc.totalExpenses += amount;
      } else {
        acc.totalIncome += amount;
      }
      return acc;
    },
    { totalExpenses: 0, totalIncome: 0 }
  );

  const balance = stats ? stats.totalIncome - stats.totalExpenses : 0;

  if (!transactions) return null;

  const gamification = transactions
    ? calculateLevel(transactions)
    : { level: 1, progress: 0, points: 0, position: 1 };
  const achievements = transactions
    ? getAchievements(transactions, balance)
    : [];
  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: tabBarHeight + 16 },
        ]}
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Movimientos</ThemedText>
          <TouchableOpacity
            onPress={() => mutate()}
            style={styles.reloadButton}
          >
            <IconSymbol
              name="arrow.clockwise"
              size={24}
              color={Colors.light.tint}
            />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.levelCard}>
          <ThemedView style={styles.levelHeader}>
            <ThemedView>
              <ThemedText style={styles.levelTitle}>
                {gamification.message}
              </ThemedText>
              <ThemedText style={styles.savingsText}>
                {gamification.points}% de ahorro
              </ThemedText>
            </ThemedView>
            <ThemedText style={styles.positionText}>
              #{gamification.position} 🏆
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.progressBar}>
            <ThemedView
              style={[
                styles.progressFill,
                { width: `${gamification.progress * 100}%` },
              ]}
            />
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.achievementsContainer}>
          <ThemedText type="subtitle" style={styles.achievementsTitle}>
            Logros ({unlockedAchievements.length}/{achievements.length})
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <ThemedView style={styles.achievementsList}>
              {achievements.map((achievement) => (
                <ThemedView
                  key={achievement.title}
                  style={[
                    styles.achievementCard,
                    !achievement.isUnlocked && styles.achievementLocked,
                  ]}
                >
                  <ThemedText style={styles.achievementEmoji}>
                    {achievement.emoji}
                  </ThemedText>
                  <ThemedText style={styles.achievementTitle}>
                    {achievement.title}
                  </ThemedText>
                  <ThemedText style={styles.achievementDescription}>
                    {achievement.description}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          </ScrollView>
        </ThemedView>

        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statCard}>
            <ThemedText style={styles.statLabel}>Balance</ThemedText>
            <ThemedText
              style={[
                styles.statAmount,
                balance >= 0 ? styles.income : styles.expense,
              ]}
            >
              {formatter.format(balance)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.statsRow}>
            <ThemedView style={[styles.statCard, styles.halfCard]}>
              <ThemedText style={styles.statLabel}>Ingresos</ThemedText>
              <ThemedText style={[styles.statAmount, styles.income]}>
                {formatter.format(stats?.totalIncome || 0)}
              </ThemedText>
            </ThemedView>

            <ThemedView style={[styles.statCard, styles.halfCard]}>
              <ThemedText style={styles.statLabel}>Gastos</ThemedText>
              <ThemedText style={[styles.statAmount, styles.expense]}>
                {formatter.format(stats?.totalExpenses || 0)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.transactionsList}>
          {transactions?.map((transaction) => (
            <ThemedView key={transaction.id} style={styles.transactionItem}>
              <ThemedView style={styles.transactionHeader}>
                <ThemedText style={styles.emoji}>
                  {transaction.emoji}
                </ThemedText>
                <ThemedView style={styles.transactionInfo}>
                  <ThemedText type="defaultSemiBold">
                    {transaction.name}
                  </ThemedText>
                  <ThemedText style={styles.date}>
                    {new Date(transaction.datetime).toLocaleDateString()}
                  </ThemedText>
                </ThemedView>
                <ThemedText
                  style={[
                    styles.amount,
                    transaction.type === "expense"
                      ? styles.expense
                      : styles.income,
                  ]}
                >
                  {transaction.type === "expense" ? "-" : "+"}
                  {formatter.format(Math.abs(transaction.value))}
                </ThemedText>
              </ThemedView>
              {transaction.description && (
                <ThemedText style={styles.description}>
                  {transaction.description}
                </ThemedText>
              )}
            </ThemedView>
          ))}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionsList: {
    gap: 16,
  },
  transactionItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emoji: {
    fontSize: 24,
  },
  transactionInfo: {
    flex: 1,
    gap: 2,
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
  },
  expense: {
    color: "#dc2626",
  },
  income: {
    color: "#16a34a",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginLeft: 36,
  },
  reloadButton: {
    padding: 8,
  },
  statsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  halfCard: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  statAmount: {
    fontSize: 20,
    fontWeight: "600",
  },
  levelCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
    color: Colors.light.tint,
  },
  savingsText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: "500",
  },
  positionText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.tint,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.tint,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
  },
  achievementsContainer: {
    marginBottom: 24,
  },
  achievementsTitle: {
    marginBottom: 16,
  },
  achievementsList: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 4,
  },
  achievementCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    width: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: "#666",
  },
});

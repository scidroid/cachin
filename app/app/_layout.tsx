import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, createContext, useContext } from "react";
import "react-native-reanimated";
import useSWR from "swr";
import {
  TextInput,
  Button,
  View,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { FormInput } from "@/components/FormInput";
import { FormButton } from "@/components/FormButton";
import { Colors } from "@/constants/Colors";

SplashScreen.preventAutoHideAsync();

const AuthContext = createContext<{
  isAuthed: boolean;
  username: string | null;
  setUsername: (username: string) => void;
  login: (username: string) => void;
} | null>(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);

  async function login(username: string) {
    setUsername(username);

    const req = await fetch(`http://localhost:3000/api/user/${username}`);
    const data = await req.json();

    console.log(data);

    setIsAuthed(data.exists);
  }

  const value = {
    isAuthed,
    username,
    setUsername,
    login,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider value={DefaultTheme}>
      {children}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

function LoginScreen({ onLogin }: { onLogin: (username: string) => void }) {
  const [input, setInput] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">¡Bienvenido! 👋</ThemedText>
          <ThemedText style={styles.subtitle}>
            Ingresa tu nombre de usuario para comenzar tu viaje financiero
          </ThemedText>
        </View>

        <View style={styles.form}>
          <FormInput
            label="Nombre de Usuario"
            value={input}
            onChangeText={setInput}
            placeholder="Ej: juan.perez"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <FormButton onPress={() => onLogin(input)} disabled={!input.trim()}>
            Continuar
          </FormButton>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Al continuar, aceptas nuestros términos y condiciones
          </ThemedText>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  header: {
    gap: 12,
    marginTop: 60,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.icon,
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  footer: {
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.icon,
    textAlign: "center",
  },
});

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AuthContent />
    </AuthProvider>
  );
}

function AuthContent() {
  const { isAuthed, login } = useAuth();

  if (!isAuthed) {
    return (
      <Layout>
        <LoginScreen onLogin={login} />
      </Layout>
    );
  }

  return (
    <Layout>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </Layout>
  );
}

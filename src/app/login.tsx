import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signIn } from "@/lib/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email || !password) {
      setError("Email y contraseña son requeridos");
      return;
    }
    setError(null);
    setLoading(true);
    const err = await signIn(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(
        err.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos"
          : err.message,
      );
    }
    // si fue exitoso, AuthProvider detecta el cambio y _layout redirige
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 px-8 justify-center gap-8">
          {/* Brand */}
          <View className="items-center gap-1">
            <Text className="text-xs uppercase tracking-[0.18em] text-gray-500">
              Mundial 2026
            </Text>
            <Text className="text-5xl font-black text-panini-blue">
              Panini·JD
            </Text>
            <Text className="text-base text-gray-600 mt-1">
              Tu álbum y los intercambios, en un solo lugar.
            </Text>
          </View>

          {/* Form */}
          <View className="gap-3">
            <View>
              <Text className="text-xs uppercase tracking-widest text-gray-500 mb-1.5">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="tu@correo.com"
                placeholderTextColor="#9ca3af"
                className="h-12 px-4 rounded-xl border border-gray-200 text-base"
              />
            </View>
            <View>
              <Text className="text-xs uppercase tracking-widest text-gray-500 mb-1.5">
                Contraseña
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                className="h-12 px-4 rounded-xl border border-gray-200 text-base"
              />
            </View>

            {error && (
              <Text className="text-sm text-panini-red px-1">{error}</Text>
            )}

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className="h-12 rounded-full bg-panini-blue items-center justify-center active:opacity-90 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  Entrar
                </Text>
              )}
            </Pressable>
          </View>

          <Text className="text-center text-sm text-gray-500">
            Si todavía no tenés cuenta,{"\n"}
            creá una desde la web:{" "}
            <Text className="text-panini-blue font-semibold">
              paninijd.vercel.app
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

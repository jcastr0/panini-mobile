import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

/**
 * Mismo backend Supabase que la web (paninijd) — sólo cambia el almacenamiento
 * de sesión: AsyncStorage en vez de cookies del navegador.
 *
 * Las claves vienen de variables EXPO_PUBLIC_* del .env.local (dev) o del
 * env de EAS Build (prod). Son públicas (anon key respeta RLS).
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "[supabase] Falta EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY. " +
      "Verifica .env.local en la raíz del proyecto y reinicia el dev server (`npm run start --clear`).",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

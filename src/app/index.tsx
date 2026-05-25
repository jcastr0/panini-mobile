import { Redirect } from "expo-router";
import { useAuth } from "@/lib/auth";

/**
 * Ruta raíz `/` — redirige al destino correcto según la sesión.
 * Hace falta porque movimos la home dentro de `(tabs)/album/index.tsx`
 * y Expo Router ya no tiene un index a nivel raíz.
 */
export default function Index() {
  const { session, loading } = useAuth();
  if (loading) return null;
  return <Redirect href={session ? ("/(tabs)/album" as never) : "/login"} />;
}

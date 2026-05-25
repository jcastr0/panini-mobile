const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// @supabase/realtime-js usa un dynamic import opcional de @opentelemetry/api con
// comentarios magic-string que Hermes no parsea. Apuntamos el import a un stub
// vacío para que el bundle no intente cargarlo. La realtime sigue funcionando.
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: "./src/global.css" });

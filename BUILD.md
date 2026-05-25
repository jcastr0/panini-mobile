# Build & distribución — Panini·JD mobile

## Setup inicial (una sola vez)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login con tu Apple/Expo account
eas login

# Linkear este proyecto a tu cuenta Expo (genera projectId)
cd ~/Docker/panini-jd-mobile
eas init
```

Esto te va a pedir confirmar slug (`panini-jd-mobile`) y agrega `extra.eas.projectId` al `app.json`.

## Variables de entorno en EAS

Como `.env.local` está gitignored, hay que subir las claves a EAS para que los builds en la nube las usen:

```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://<tu-proyecto>.supabase.co" --environment production --environment preview --environment development
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<tu-anon-key>" --environment production --environment preview --environment development
```

(Valores los sacas de `~/Docker/paninijd/.env.local` — son los mismos que la web.)

## Builds

### iOS development (simulator) — más rápido para iterar

```bash
eas build --profile development --platform ios
```

Genera un `.tar.gz` con el simulator build. Lo descargás y lo soltás en el simulator → corre la app sin Expo Go (compilado nativo, performance real).

### iOS preview (TestFlight)

```bash
eas build --profile preview --platform ios
```

Genera un `.ipa` para device. Subirlo a TestFlight con:

```bash
eas submit --platform ios --latest
```

Apple te pide:
- App Name único en App Store Connect → "Panini·JD"
- Bundle Identifier → `com.jcastr0.paninijd` (ya configurado)
- SKU → cualquier identificador único, ej. `paninijd-2026`

Después de submit, en App Store Connect → TestFlight → Internal Testing → agregas hasta 100 emails (tu Apple ID + JD + amigos). Llega un mail con link de TestFlight.

### Android development

```bash
eas build --profile development --platform android
```

Genera un `.apk`. Lo instalás en el emulator (`adb install panini-jd-mobile.apk`) o lo mandás por link a un Android físico.

### Android preview (Google Play Internal Testing)

```bash
eas build --profile preview --platform android
eas submit --platform android --latest
```

Google Play Console te pide:
- Service Account JSON (de Google Cloud) → EAS lo guarda con `eas credentials`
- App ID interno único → `com.jcastr0.paninijd`

Después en Play Console → Testing → Internal testing → agregas emails de testers.

## Versionamiento

`autoIncrement: true` en el perfil production hace que EAS suba la versión automática (build number en iOS, versionCode en Android). El `version: "1.0.0"` del `app.json` se sube manual cuando hay un release con cambios mayores.

## Updates OTA (Expo Update)

Para cambios sólo de JavaScript (UI, queries, lógica) sin nuevos módulos nativos, se puede empujar OTA sin re-build:

```bash
eas update --channel production --message "fix: corregido conteo de cromos"
```

Los users que ya tienen la app instalada reciben el update al abrirla siguiente vez. Aprox 10 segundos. Más rápido que App Store review.

## Comandos útiles

```bash
eas build:list           # historial de builds
eas build:view           # detalles del último (descarga, status)
eas channel:list         # canales OTA y a qué build apuntan
eas device:list          # devices registradas (para profiles internos)
```

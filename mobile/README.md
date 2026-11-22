# OFC360 Native Mobile App (Expo SDK 52 + Expo Router + NativeWind)

True React Native + Expo mobile application in `/mobile/` supporting all 5 OFC360 enterprise roles with native device capabilities.

## Stack
- **Expo SDK 52** + **Expo Router v4** (`app/(auth)/*`, `app/(hr-admin)/(tabs)/*`, `app/(employee)/(tabs)/*`, `app/(manager)/(tabs)/*`, `app/(it-admin)/(tabs)/*`, `app/(executive)/(tabs)/*`)
- **NativeWind v4** (`tailwind.config.js`, `global.css`)
- **Native Device Modules**:
  - `expo-camera`: Face Check-In front camera preview & IT Asset QR scanner
  - `expo-location`: GPS geofence radius verification on attendance punch-in/out
  - `expo-notifications`: Push registration & local native alerts
  - `expo-secure-store`: Encrypted JWT session persistence
  - `expo-document-picker` & `expo-file-system` + `expo-sharing`: KYC document upload and Payslip / Board CSV download & native share sheet
  - `expo-haptics` + `@gorhom/bottom-sheet` + `RefreshControl` + animated skeleton loaders

## Run Locally (Expo CLI)
```bash
cd mobile
npm install --legacy-peer-deps
npx expo start
```

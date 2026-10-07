# Helderville QR travel card

A small Expo app that shows a Helderville Council travel card and adds it to the phone’s wallet. iOS receives an Apple Wallet pass. Android receives a Google Wallet transit pass. Both are issued by a local Node server.

The card on screen, the Apple pass, and the Google pass all read the same Helderville record in `shared/tenants.json`.

## Requirements

- Node.js
- Xcode, for an iOS build
- Android Studio and a device or emulator, for an Android build
- Apple Wallet signing certificates, if you want to add the pass on iOS
- A Google Wallet issuer account, if you want to add the pass on Android

## Run the app

From the repository root:

```bash
npm install
npm run ios
```

or:

```bash
npm run android
```

`npm install` applies the patches in `patches/` through `patch-package`. The Android wallet button depends on that step.

The home screen icon and launch screen are native assets. Change them, then run `npm run ios` or `npm run android` again. A Metro reload does not replace them.

## Run the pass server

In a second terminal:

```bash
cd server
npm install
npm run dev
```

The server listens on port 3000. `GET /` returns `{ "status": "ok" }`.

| Route | Used by | Response |
| --- | --- | --- |
| `POST /` | iOS | An Apple pass (`application/vnd.apple.pkpass`) |
| `POST /google` | Android | A Google Save to Wallet token |

Send JSON with `name` and `tenantId`. The only tenant is `helderville`.

The server does not reload itself when code or `.env` changes. Stop it and run `npm run dev` again.

### Android phone

The Android app calls `http://127.0.0.1:3000`. On a physical phone that address is the phone, so forward the Mac’s port while the phone is plugged in:

```bash
adb reverse tcp:3000 tcp:3000
```

Run that again if `adb` restarts. The iOS app calls `http://localhost:3000`, which is the machine running the simulator.

## Project layout

```text
app/                  Expo Router screens
components/           Travel card and wallet button
shared/tenants.json   Card copy, colours, and Apple pass images
server/index.js       Fastify routes
server/apple/         Apple Wallet pass, model, images, and certificates
server/google/        Google Wallet transit pass and credentials
```

Colours in the app come from `shared/tenants.json` through `tailwind.config.js`. Do not hard-code colours in screens or components.

## Apple Wallet

Certificates belong in `server/apple/cert/` and stay out of git:

- `wwdr.pem`
- `signerCert.pem`
- `signerKey.pem`

`server/apple/qr-travel.pass` is the pass model. `server/apple/tenant-assets/helderville` supplies the logo and icon. See `server/apple/README.md`.

## Google Wallet

Create `server/google/.env`. It is gitignored. Set:

- `GOOGLE_WALLET_ISSUER_ID`
- `GOOGLE_WALLET_CLASS_SUFFIX`
- `GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_WALLET_PRIVATE_KEY`
- `GOOGLE_WALLET_LOGO_URL`

`GOOGLE_WALLET_LOGO_URL` must be a public HTTPS image. Google refuses a transit pass without one. Keep the private key in `.env` only, and store newlines as `\n`.

The transit class is sent as `UNDER_REVIEW`. Google shows `[TEST ONLY]` on the pass until the class is approved in the Wallet console. See `server/google/README.md`.

## Checks

```bash
npm run lint
```

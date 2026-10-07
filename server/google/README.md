Google Wallet transit pass for the Helderville QR travel card.

`POST /google` returns a Save to Wallet token. The app calls this on Android.

`createGooglePass.js` reads `shared/tenants.json` and the gitignored `.env` in this folder:

- `GOOGLE_WALLET_ISSUER_ID`
- `GOOGLE_WALLET_CLASS_SUFFIX`
- `GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_WALLET_PRIVATE_KEY`
- `GOOGLE_WALLET_LOGO_URL` — a public HTTPS image

Restart `npm run dev` after changing `.env`. The process loads those values only at startup.

Apple Wallet pass for the Helderville QR travel card.

`POST /` returns `application/vnd.apple.pkpass`. The app calls this on iOS.

- `createTravelPass.js` builds the pass from `shared/tenants.json`.
- `qr-travel.pass` is the live pass model.
- `tenant-assets/helderville` supplies the logo and icon.
- `cert` holds `wwdr.pem`, `signerCert.pem`, and `signerKey.pem`. Those files stay out of git.

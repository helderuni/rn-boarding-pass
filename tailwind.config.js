const tenantsFile = require('./shared/tenants.json');

const helderville = tenantsFile.tenants.find((tenant) => tenant.id === 'helderville');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: helderville.colors.accent,
        secondary: helderville.colors.ink,
        white: tenantsFile.white,
        status: {
          active: tenantsFile.statusColor,
        },
        helderville: {
          ink: helderville.colors.ink,
          accent: helderville.colors.accent,
          accentPressed: helderville.colors.accentPressed,
          cream: helderville.colors.cream,
          sand: helderville.colors.sand,
          line: helderville.colors.line,
          muted: helderville.colors.muted,
          card: helderville.colors.card,
          onCard: helderville.colors.onCard,
        },
      },
    },
  },
  plugins: [],
};

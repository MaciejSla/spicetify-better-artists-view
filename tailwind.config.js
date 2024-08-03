/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,tsx}"],
  theme: {
    extend: {
      colors: {
        spice: {
          text: "var(--spice-text)",
          subtext: "var(--spice-subtext)",
          main: {
            DEFAULT: "var(--spice-main)",
            elevated: "var(--spice-main-elevated)",
          },
          highlight: {
            DEFAULT: "var(--spice-highlight)",
            elevated: "var(--spice-highlight-elevated)",
          },
          sidebar: "var(--spice-sidebar)",
          player: "var(--spice-player)",
          card: "var(--spice-card)",
          shadow: "var(--spice-shadow)",
          "selected-row": "var(--spice-selected-row)",
          button: {
            DEFAULT: "var(--spice-button)",
            active: "var(--spice-button-active)",
            disabled: "var(--spice-button-disabled)",
          },
          "tab-active": "var(--spice-tab-active)",
          notification: {
            DEFAULT: "var(--spice-notification)",
            error: "var(--spice-notification-error)",
          },
          misc: "var(--spice-misc)",
        },
      },
    },
  },
  plugins: [],
};

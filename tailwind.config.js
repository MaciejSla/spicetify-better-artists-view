/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,tsx}"],
  theme: {
    extend: {
      colors: {
        spice: {
          text: "rgba(var(--spice-rgb-text), <alpha-value>)",
          subtext: "rgba(var(--spice-rgb-subtext), <alpha-value>)",
          main: {
            DEFAULT: "rgba(var(--spice-rgb-main), <alpha-value>)",
            elevated: "rgba(var(--spice-rgb-main-elevated), <alpha-value>)",
          },
          highlight: {
            DEFAULT: "rgba(var(--spice-rgb-highlight), <alpha-value>)",
            elevated:
              "rgba(var(--spice-rgb-highlight-elevated), <alpha-value>)",
          },
          sidebar: "rgba(var(--spice-rgb-sidebar), <alpha-value>)",
          player: "rgba(var(--spice-rgb-player), <alpha-value>)",
          card: "rgba(var(--spice-rgb-card), <alpha-value>)",
          shadow: "rgba(var(--spice-rgb-shadow), <alpha-value>)",
          "selected-row": "rgba(var(--spice-rgb-selected-row), <alpha-value>)",
          button: {
            DEFAULT: "rgba(var(--spice-rgb-button), <alpha-value>)",
            active: "rgba(var(--spice-rgb-button-active), <alpha-value>)",
            disabled: "rgba(var(--spice-rgb-button-disabled), <alpha-value>)",
          },
          "tab-active": "rgba(var(--spice-rgb-tab-active), <alpha-value>)",
          notification: {
            DEFAULT: "rgba(var(--spice-rgb-notification), <alpha-value>)",
            error: "rgba(var(--spice-rgb-notification-error), <alpha-value>)",
          },
          misc: "rgba(var(--spice-rgb-misc), <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};

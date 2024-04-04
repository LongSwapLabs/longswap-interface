const {nextui} = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Roboto', 'sans-serif'],
      serif: ['Roboto', 'serif'],
    },
    // 添加自定义动画
    animation: {
      flip: 'flip 1.2s infinite',
    },
    // 定义动画关键帧
    keyframes: {
      flip: {
        '0%, 100%': { transform: 'rotateY(0deg)' },
        '50%': { transform: 'rotateY(180deg)' },
      },
    },
  },
  darkMode: "class",
  plugins: [nextui({
    themes: {
      light: {
        colors: {
          primary: {
            DEFAULT: "#7c3aed",
            foreground: "#FFF",
          },
          secondary: {
            DEFAULT: "#eb2f96",
            foreground: "#FFF",
          },
          focus: "#7c3aed",
        },
      },
    },
  })],
}

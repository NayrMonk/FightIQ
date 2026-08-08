// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const a11y = require("eslint-plugin-react-native-a11y");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-native-a11y": a11y },
    rules: {
      ...a11y.configs.ios.rules,
      ...a11y.configs.android.rules,
      // A hint on every single labeled control is not standard practice (Apple's HIG treats
      // hints as optional, for actions whose outcome isn't obvious from the label/role alone).
      // Keep the meaningful baseline: every interactive element still needs a role + label.
      "react-native-a11y/has-accessibility-hint": "off",
    },
  },
  {
    files: ["jest.setup.js", "jest.config.js"],
    languageOptions: { globals: { jest: "readonly", require: "readonly", module: "writable" } },
  },
]);

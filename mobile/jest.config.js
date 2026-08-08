module.exports = {
  preset: "jest-expo",
  setupFiles: ["./jest.setup.js"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
};

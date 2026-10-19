export default {
  testDir: "./src",
  testMatch: "**/*.integration.spec.ts",
  timeout: 30_000,
  workers: 1,
  reporter: "list",
  outputDir: "./test-results",
}

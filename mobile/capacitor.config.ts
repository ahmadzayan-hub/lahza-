import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.promptorchestrator.android",
  appName: "Prompt Orchestrator",
  webDir: "../public",
  // Point the wrapped app at your deployed URL.
  // For dev, use http://10.0.2.2:3000 from the Android emulator.
  server: {
    url: "https://your-deploy.example.com",
    cleartext: false,
    androidScheme: "https"
  },
  android: {
    backgroundColor: "#f8fafc"
  }
};

export default config;

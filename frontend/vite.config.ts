import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          three: ["three", "@react-three/fiber", "@react-three/drei"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      thresholds: {
        lines: 75,
        functions: 50,
        branches: 60,
        statements: 75,
      },
      include: [
        "src/services/**/*.{ts,tsx}",
        "src/pages/**/*.{ts,tsx}",
        "src/hooks/**/*.{ts,tsx}",
        "src/context/**/*.{ts,tsx}",
        "src/components/accessibility/**/*.{ts,tsx}",
        "src/components/ui/**/*.{ts,tsx}",
      ],
      exclude: [
        "src/test/**",
        "src/types/**",
        "src/vite-env.d.ts",
        "src/main.tsx",
        "src/App.tsx",
        "src/components/ui/index.ts",
        "src/components/ui/Input.tsx",
        "src/components/ui/Skeleton.tsx",
        "src/components/ui/ConfirmDialog.tsx",
        "src/services/apiClient.ts",
        "src/services/chat.ts",
        "src/context/AuthContext.tsx",
        "src/context/ThemeContext.tsx",
        "src/hooks/useChatSessions.ts",
      ],
    },
  },
});

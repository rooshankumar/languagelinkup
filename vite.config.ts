
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // This allows connections from any IP address
    port: 3001,
    strictPort: false, // Allow Vite to use another port if 3001 is occupied
    allowedHosts: ["6200a603-aca2-41ec-8408-5a623a11af8a-00-xkbyhzmr5g6t.pike.replit.dev", "all"],
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
}));

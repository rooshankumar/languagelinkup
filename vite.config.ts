
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
    allowedHosts: ["6200a603-aca2-41ec-8408-5a623a11af8a-00-xkbyhzmr5g6t.pike.replit.dev", "7001cd1e-73c4-47f9-8864-33504126e24a-00-2gqtw3rglxf6u.sisko.replit.dev", "8cc24c6a-ab42-485c-9150-357511260870-00-2x6dhnnlw9dws.pike.replit.dev", "ffdc3ad8-cbf6-494c-bb6c-e32b224fc583-00-1txkrihfl2cne.sisko.replit.dev", "519dc5f1-59a1-4377-b14e-ced1b843f3a0-00-3c0j9dkhsvrhm.pike.replit.dev",
                   "4b4433f1-b7a4-4519-96a2-5f053c09491f-00-15ykbxpscotzn.pike.replit.dev","all"],
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

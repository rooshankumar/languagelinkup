
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 3001,
    strictPort: false,
    allowedHosts: [
      "6200a603-aca2-41ec-8408-5a623a11af8a-00-xkbyhzmr5g6t.pike.replit.dev","4120d373-2306-4520-8093-0378c8e8bb95-00-2uzgac172b12y.pike.replit.dev" ,"5a26870e-ba06-436d-b121-ac78f2ab02e5-00-35yf96lqew2dc.pike.replit.dev","5ba576cf-a4ae-4be6-bc6c-f2d912c2d708-00-2zznqlgdu7zep.sisko.repl.co","ef3b1f80-98a5-4b17-a8c8-bbba6ac1ca50-00-39kw2giljm9c6.pike.replit.dev" ,"a59b62ab-cc61-4e77-9b72-9106b413f847-00-1jifo6qmua7bw.sisko.replit.dev","a30bd6a8-4bd6-42e5-a3e3-197508c8757c-00-3g9er34zfftqd.pike.replit.dev","9ec223de-0e4d-4b0f-a2ac-2c3c4ed27f9b-00-1jkbxu2oa02vf.pike.replit.dev","39e32fdf-3ff7-4e0b-bbb4-85a879664bd2-00-1jt2cpsdyzvwn.pike.replit.dev",
      "7001cd1e-73c4-47f9-8864-33504126e24a-00-2gqtw3rglxf6u.sisko.replit.dev",
      "fff8f511-bc76-4636-9b8a-7b825d99beac-00-3j33owa5eiaf0.pike.replit.dev",
      "4a65f675-9a22-48a0-acb0-df7f4cbbf60d-00-29u6rzodkf2mr.pike.replit.dev",
      "90c1ea73-d866-4aaf-9ee1-01dee1723389-00-32fonttlmrouo.pike.replit.dev",
      "8cc24c6a-ab42-485c-9150-357511260870-00-2x6dhnnlw9dws.pike.replit.dev",
      "ffdc3ad8-cbf6-494c-bb6c-e32b224fc583-00-1txkrihfl2cne.sisko.replit.dev",
      "519dc5f1-59a1-4377-b14e-ced1b843f3a0-00-3c0j9dkhsvrhm.pike.replit.dev",
      "4b4433f1-b7a4-4519-96a2-5f053c09491f-00-15ykbxpscotzn.pike.replit.dev",
      "all"
    ],
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
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

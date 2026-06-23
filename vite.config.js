import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Only used during `npm run dev` — proxies API calls to the Express backend
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});

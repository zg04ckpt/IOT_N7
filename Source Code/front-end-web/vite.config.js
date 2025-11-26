import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: './localhost+2-key.pem',
      cert: './localhost+2.pem',
    },
    port: 5173,
    open: true,
  },
});

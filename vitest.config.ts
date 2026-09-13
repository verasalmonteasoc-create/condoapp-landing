import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Mismo patrón que frontend/vitest.config.ts en el repositorio de la app:
// Vitest compartiendo el resolutor del build real, no una config de Jest en
// paralelo que un día diverge sin que nadie lo note.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["pruebas/**/*.test.{ts,tsx}"],
  },
});

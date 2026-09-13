import { defineConfig, devices } from "@playwright/test";

/**
 * Corre contra el sitio COMPLETO, no contra "next dev": `next dev` no sirve
 * `functions/`, que es una convención propia de Cloudflare Pages -sin
 * `wrangler pages dev`, un POST a "/api/solicitud-demo" daría 404 y la
 * prueba estaría comprobando un formulario que nunca llega a hablar con
 * nada-. `webServer` de abajo arranca justo eso: el export estático de
 * verdad (`out/`, generado antes por `npm run build:e2e`), servido por el
 * mismo motor que usa Cloudflare Pages, con KV emulado en memoria -sin
 * cuenta ni credenciales reales, ver el comentario en package.json-.
 *
 * Turnstile SÍ se resuelve de verdad, con las claves de prueba que publica
 * Cloudflare (ver .dev.vars.example): la alternativa -interceptar la
 * llamada a challenges.cloudflare.com con Playwright- dejaría sin probar
 * el enganche real entre el widget y `lib/useTurnstile.ts`. Lo único que SÍ
 * se intercepta es Airtable (en el propio spec): no hay una base real
 * todavía, y aunque la hubiera, un cheque de CI no debe escribir leads
 * falsos en un negocio de verdad.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: "http://127.0.0.1:8788",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npx wrangler pages dev out --port=8788 --kv=LIMITADOR --compatibility-date=2026-09-01",
    url: "http://127.0.0.1:8788",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});

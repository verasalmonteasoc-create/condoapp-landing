import { expect, test } from "@playwright/test";

/**
 * Corre contra la Function real -ver playwright.config.ts para el porqué-.
 * Turnstile se resuelve de verdad con la sitekey de prueba
 * "1x00000000000000000000AA" (siempre pasa), y MODO_PRUEBA en .dev.vars
 * hace que la Function responda éxito sin llamarle a una Airtable real.
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  // El banner de cookies es lo primero que aparece, y su franja inferior
  // podría tapar el botón de enviar en una ventana angosta -se descarta
  // antes de tocar el formulario, como haría cualquier persona real-.
  const rechazar = page.getByRole("button", { name: "Rechazar" });
  if (await rechazar.isVisible().catch(() => false)) await rechazar.click();
});

test("llena el formulario y llega a la confirmación", async ({ page }) => {
  // `exact: true` en "Nombre": sin eso, Playwright hace coincidencia
  // parcial y "Nombre" calza tanto en el campo "Nombre" como en "Nombre del
  // condominio" -devuelve los dos y falla por ambigüedad, no por un
  // problema del formulario-.
  await page.getByLabel("Nombre", { exact: true }).fill("María Fernández");
  await page.getByLabel("WhatsApp").fill("8095550123");
  await page.getByLabel("Nombre del condominio").fill("Residencial Los Robles");
  await page.getByLabel("Cantidad de apartamentos").fill("24");

  const enviar = page.getByRole("button", { name: /Enviar solicitud/ });
  // Turnstile resuelve de forma asíncrona -carga su script, corre su
  // verificación (falsa, por la sitekey de prueba)-; el botón sigue
  // deshabilitado hasta que `useTurnstile` reciba el token. Sin esta
  // espera, el clic de abajo llegaría antes de tiempo y el envío fallaría
  // con "completa la verificación", que sería un falso negativo de la
  // prueba, no un error real del sitio.
  await expect(enviar).toBeEnabled({ timeout: 15_000 });
  await enviar.click();

  await expect(page).toHaveURL(/\/gracias/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Recibimos tu solicitud, María",
  );
  await expect(page.getByText(/809 555 0123/)).toBeVisible();
});

test("un WhatsApp inválido se marca sin llegar a enviar nada", async ({ page }) => {
  await page.getByLabel("Nombre", { exact: true }).fill("María Fernández");
  await page.getByLabel("WhatsApp").fill("123");
  await page.getByLabel("Nombre del condominio").fill("Residencial Los Robles");

  await page.getByRole("button", { name: /Enviar solicitud/ }).click();

  // No debe navegar a ningún lado: el error es del navegador, antes de
  // que exista una sola petición de red.
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(/número de 10 dígitos/)).toBeVisible();
});

import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("Viser tittel og overskriften", async ({ page }) => {
  await expect(page).toHaveTitle(/Dagpenger rapportering/);
  await expect(page.getByText(/Dagpengerapportering/)).toBeVisible();
});

test("Viser rapporteringsalternativer uten svar for første gang", async ({ page }) => {
  const radioAktivitet = page.getByRole("radio", { name: "Ja, jeg har noe å rapportere" });
  const radioIngenAktiviet = page.getByRole("radio", {
    name: "Nei, jeg har ikke jobbet, vært syk, hatt fravær/ferie eller deltatt på kurs/utdanning",
  });

  await expect(radioAktivitet).not.toBeChecked();
  await expect(radioIngenAktiviet).not.toBeChecked();
});

test("Viser ikke neste-knappen dersom rapporteringsalternativene ikke er valgt.", async ({
  page,
}) => {
  await expect(page.getByRole("button", { name: "Neste" })).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Til Utfylling" })).not.toBeVisible();
});

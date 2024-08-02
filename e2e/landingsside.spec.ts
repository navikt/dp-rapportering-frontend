import { withSanitySetup } from "./sanity";
import { expect, test } from "@playwright/test";

test.describe("Landingsside", () => {
  let getAppText: (textId: string) => string;

  test.beforeAll(async () => {
    const sanity = await withSanitySetup();
    getAppText = sanity.getAppText;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Viser tittel og overskriften", async ({ page }) => {
    const tittel = "Dagpenger rapportering";
    const overskrift = page.getByRole("heading", { name: getAppText("rapportering-tittel") });

    await expect(page).toHaveTitle(tittel);
    await expect(overskrift).toBeVisible();
  });

  test("Viser rapporteringsalternativer uten svar for første gang", async ({ page }) => {
    const radioAktivitet = page.getByRole("radio", {
      name: getAppText("rapportering-noe-å-rapportere"),
    });
    const radioIngenAktiviet = page.getByRole("radio", {
      name: getAppText("rapportering-ingen-å-rapportere"),
    });

    await expect(radioAktivitet).not.toBeChecked();
    await expect(radioIngenAktiviet).not.toBeChecked();
  });

  test("Viser ikke neste-knappen dersom rapporteringsalternativene ikke er valgt.", async ({
    page,
  }) => {
    const nesteKnapp = page.getByRole("button", { name: getAppText("rapportering-knapp-neste") });
    const tilUtfyllingKnapp = page.getByRole("button", { name: "Til Utfylling" });

    await expect(nesteKnapp).not.toBeVisible();
    await expect(tilUtfyllingKnapp).not.toBeVisible();
  });
});

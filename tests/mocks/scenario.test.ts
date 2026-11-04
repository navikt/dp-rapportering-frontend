// @vitest-environment node
import { afterEach, describe, expect, test } from "vitest";

import { ScenarioType } from "~/devTools";
import { hentArbeidssokerstatusVisning } from "~/utils/arbeidssokerstatus.utils";
import { ARBEIDSSOKERSTATUS_AARSAK } from "~/utils/types";

import { withDb } from "../../mocks/responses/db";
import { sessionRecord } from "../../mocks/session";

describe("dev-scenario for manglende ansvar", () => {
  const dbPromise = sessionRecord.getDatabase(crypto.randomUUID());

  afterEach(async () => {
    await withDb(await dbPromise).clear();
  });

  test("lagrer årsaken før scenarioet returnerer og låser spørsmålet i ny flyt", async () => {
    const db = withDb(await dbPromise);
    await db.clear();
    await db.updateRapporteringsperioder(ScenarioType.ikkeAnsvar);

    const [periode] = db.findAllRapporteringsperioder();

    expect(periode.sporsmalOmRegistrertArbeidssoker?.arsakBrukerHarIkkeSvart).toBe(
      ARBEIDSSOKERSTATUS_AARSAK.DAGPENGER_HAR_IKKE_ANSVAR_FOR_SPORSMAL_OM_ARBEIDSSOKERSTATUS,
    );
    expect(hentArbeidssokerstatusVisning(periode, true).svarLaast).toBe(true);
  });
});

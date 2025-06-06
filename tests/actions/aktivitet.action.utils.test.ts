import { uuidv7 } from "uuidv7";
import { describe, expect, it, vi } from "vitest";

import { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";
import { oppdaterAktiviteter } from "~/utils/aktivitet.utils";
import { AktivitetType } from "~/utils/aktivitettype.utils";

vi.mock("uuidv7", () => ({
  uuidv7: vi.fn(() => "mocked_uuid"),
}));

describe("oppdaterAktiviteter", () => {
  it("skal filtrere ut aktiviteter som ikke er i aktivitetsTyper", () => {
    const dato = "2024-06-13";

    const dag: IRapporteringsperiodeDag = {
      dato,
      dagIndex: 0,
      aktiviteter: [
        { type: AktivitetType.Arbeid, timer: "PT8H" },
        { type: AktivitetType.Utdanning },
      ],
    };
    const aktivitetsTyper: AktivitetType[] = [AktivitetType.Utdanning];

    const oppdatertDag = oppdaterAktiviteter(dag, aktivitetsTyper, dato, "");

    expect(oppdatertDag.aktiviteter.length).toBe(1);
    expect(oppdatertDag.aktiviteter[0].type).toBe("Utdanning");
  });

  it("skal oppdatere eksisterende Arbeid aktivitet med ny varighet", () => {
    const dato = "2024-06-13";

    const dag: IRapporteringsperiodeDag = {
      dato,
      dagIndex: 0,
      aktiviteter: [
        { type: AktivitetType.Arbeid, timer: "PT8H" },
        { type: AktivitetType.Utdanning },
      ],
    };
    const aktivitetsTyper: AktivitetType[] = [AktivitetType.Arbeid, AktivitetType.Utdanning];
    const varighet = "5";

    const oppdatertDag = oppdaterAktiviteter(dag, aktivitetsTyper, dato, varighet);

    expect(oppdatertDag.aktiviteter.length).toBe(2);

    const arbeidsAktivitet = oppdatertDag.aktiviteter.find((a) => a.type === "Arbeid");
    expect(arbeidsAktivitet?.timer).toBe("PT5H");

    expect(uuidv7).not.toHaveBeenCalled();
  });

  it("skal legge til nye aktiviteter som ikke allerede finnes", () => {
    const dato = "2024-06-13";
    const dag: IRapporteringsperiodeDag = {
      dato,
      dagIndex: 0,
      aktiviteter: [],
    };
    const aktivitetsTyper: AktivitetType[] = [AktivitetType.Syk];

    const oppdatertDag = oppdaterAktiviteter(dag, aktivitetsTyper, dato, "");

    expect(oppdatertDag.aktiviteter.length).toBe(1);
    expect(oppdatertDag.aktiviteter[0].type).toBe("Syk");

    expect(uuidv7).toHaveBeenCalled();
  });
});

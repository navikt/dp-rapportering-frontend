import { describe, expect, test } from "vitest";

import { AktivitetType, IAktivitet } from "~/utils/aktivitettype.utils";

import {
  erAktiviteteneLike,
  erAktivitetenLik,
  erPeriodeneLike,
  periodeSomTimer,
  sorterAktiviteter,
} from "../../app/utils/periode.utils";
import { innsendtRapporteringsperioderResponse } from "../../mocks/responses/innsendtRapporteringsperioderResponse";

describe("periodeSomTimer", () => {
  test("skal returnere riktig antall timer for en gyldig periode-streng", () => {
    expect(periodeSomTimer("PT2H30M")).toBe(2.5);
  });

  test("skal kaste error hvis periode-strengen er ugyldig", () => {
    expect(() => periodeSomTimer("ugyldig-periode")).toThrow("Invalid duration");
  });
});

describe("sorterAktiviteter", () => {
  test("skal sortere aktiviteter etter type", () => {
    const aktiviteter = [
      { type: AktivitetType.Syk },
      { type: AktivitetType.Arbeid },
      { type: AktivitetType.Utdanning },
    ];

    const sorterteAktiviteter = aktiviteter.sort(sorterAktiviteter);

    expect(sorterteAktiviteter).toEqual([
      { type: AktivitetType.Arbeid },
      { type: AktivitetType.Syk },
      { type: AktivitetType.Utdanning },
    ]);
  });

  test("skal sortere aktiviteter etter timer hvis type er lik", () => {
    const aktiviteter = [
      { type: AktivitetType.Arbeid, timer: "PT5H" },
      { type: AktivitetType.Arbeid, timer: "PT3H" },
      { type: AktivitetType.Arbeid, timer: "PT7H" },
    ];

    const sorterteAktiviteter = aktiviteter.sort(sorterAktiviteter);

    expect(sorterteAktiviteter).toEqual([
      { type: AktivitetType.Arbeid, timer: "PT3H" },
      { type: AktivitetType.Arbeid, timer: "PT5H" },
      { type: AktivitetType.Arbeid, timer: "PT7H" },
    ]);
  });

  test("skal sortere aktiviteter etter type og timer", () => {
    const aktiviteter = [
      { type: AktivitetType.Arbeid, timer: "PT5H" },
      { type: AktivitetType.Arbeid, timer: "PT3H" },
      { type: AktivitetType.Syk },
      { type: AktivitetType.Arbeid, timer: "PT7H" },
    ];

    const sorterteAktiviteter = aktiviteter.sort(sorterAktiviteter);

    expect(sorterteAktiviteter).toEqual([
      { type: AktivitetType.Arbeid, timer: "PT3H" },
      { type: AktivitetType.Arbeid, timer: "PT5H" },
      { type: AktivitetType.Arbeid, timer: "PT7H" },
      { type: AktivitetType.Syk },
    ]);
  });
});

describe("erAktivitetenLik", () => {
  test("aktiviteter med ulik type returnerer false", () => {
    const aktiviteteneErLike = erAktivitetenLik(
      { type: AktivitetType.Syk },
      { type: AktivitetType.Utdanning },
    );
    expect(aktiviteteneErLike).toBe(false);
  });

  test("aktiviteter med lik type, men ulike timer, returnerer false", () => {
    const aktiviteteneErLike = erAktivitetenLik(
      { type: AktivitetType.Arbeid, timer: "PT5H" },
      { type: AktivitetType.Arbeid, timer: "PT6H" },
    );
    expect(aktiviteteneErLike).toBe(false);
  });

  test("aktiviteter med samme type og timer returnerer true", () => {
    const aktiviteteneErLike = erAktivitetenLik(
      { type: AktivitetType.Arbeid, timer: "PT5H" },
      { type: AktivitetType.Arbeid, timer: "PT5H" },
    );
    expect(aktiviteteneErLike).toBe(true);
  });
});

describe("erAktiviteneLike", () => {
  test("aktivitene er like returnerer true", () => {
    const aktiviteteneErLike = erAktiviteteneLike(
      [{ type: AktivitetType.Syk }],
      [{ type: AktivitetType.Syk }],
    );
    expect(aktiviteteneErLike).toBe(true);
  });

  test("aktivitene er like, men i motsatt rekkefølge, returnerer true", () => {
    const aktiviteteneErLike = erAktiviteteneLike(
      [
        {
          type: AktivitetType.Arbeid,
          timer: "PT5H",
        },
        { type: AktivitetType.Syk },
      ],
      [
        { type: AktivitetType.Syk },
        {
          type: AktivitetType.Arbeid,
          timer: "PT5H",
        },
      ],
    );

    expect(aktiviteteneErLike).toBe(true);
  });

  test("aktivitene er ulike returnerer false", () => {
    const aktiviteteneErLike = erAktiviteteneLike(
      [{ type: AktivitetType.Syk }],
      [{ type: AktivitetType.Arbeid }],
    );
    expect(aktiviteteneErLike).toBe(false);
  });

  test("det er ulikt antall aktiviteter returnerer false", () => {
    const aktiviteteneErLike = erAktiviteteneLike(
      [{ type: AktivitetType.Syk }, { type: AktivitetType.Arbeid }],
      [{ type: AktivitetType.Arbeid }],
    );
    expect(aktiviteteneErLike).toBe(false);
  });
});

describe("erPeriodeneLike", () => {
  const periode = JSON.parse(JSON.stringify(innsendtRapporteringsperioderResponse[0]));
  periode.dager[0].aktiviteter[0].type = "Syk";
  delete periode.dager[0].aktiviteter[0].timer;
  // periode.dager[0].aktiviteter[0].type === "Syk"
  // periode.dager[0].aktiviteter[1].type === "Arbeid"

  const originalPeriode = JSON.parse(JSON.stringify(periode));

  test("perioder med ulike fraOgMed og tilOgMed returnerer false", () => {
    originalPeriode.periode.fraOgMed = "2021-05-01";
    expect(erPeriodeneLike(periode, originalPeriode)).toBe(false);

    // Rydd opp
    originalPeriode.periode.fraOgMed = periode.periode.fraOgMed;
  });

  test("perioder med samme aktivitet på mandag returnerer true", () => {
    expect(erPeriodeneLike(periode, originalPeriode)).toBe(true);
  });

  test("perioder med samme aktiviteter på mandag, men i ulik rekkefølge, returnerer true", () => {
    originalPeriode.dager[0].aktiviteter = [
      ...originalPeriode.dager[0].aktiviteter.map((aktivitet: IAktivitet) => ({ ...aktivitet })),
    ].reverse();

    expect(erPeriodeneLike(periode, originalPeriode)).toBe(true);

    // Rydd opp
    originalPeriode.dager[0].aktiviteter = [
      ...originalPeriode.dager[0].aktiviteter.map((aktivitet: IAktivitet) => ({ ...aktivitet })),
    ];
  });

  test("perioder med samme arbeid på mandag, men ulikt timetall returnerer false", () => {
    originalPeriode.dager[0].aktiviteter[1].timer = "PT6H";

    expect(erPeriodeneLike(periode, originalPeriode)).toBe(false);

    // Rydd opp
    originalPeriode.dager[0].aktiviteter[1].timer = "PT5H";
  });

  test("perioder der en aktivitet er tatt ut returnerer false", () => {
    const aktiviteter = [
      ...periode.dager[0].aktiviteter.map((aktivitet: IAktivitet) => ({ ...aktivitet })),
    ];

    periode.dager[0].aktiviteter = [aktiviteter[0]];

    expect(erPeriodeneLike(periode, originalPeriode)).toBe(false);

    // Rydd opp
    periode.dager[0].aktiviteter = [...aktiviteter];
  });

  test("perioder der aktivitet er flyttet fra mandag til tirsdag returnerer false", () => {
    const tirsdagsAktiviteter = [
      ...originalPeriode.dager[1].aktiviteter.map((aktivitet: IAktivitet) => ({ ...aktivitet })),
    ];
    originalPeriode.dager[1].aktiviteter = [
      ...originalPeriode.dager[0].aktiviteter.map((aktivitet: IAktivitet) => ({ ...aktivitet })),
    ];

    // Rydd opp
    expect(erPeriodeneLike(periode, originalPeriode)).toBe(false);
    originalPeriode.dager[0].aktiviteter[1] = [...tirsdagsAktiviteter];
  });
});

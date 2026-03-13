// @vitest-environment node
import { times } from "remeda";
import { uuidv7 } from "uuidv7";
import { describe, expect, test } from "vitest";

import { beregnNåværendePeriodeDato } from "~/devTools/periodedato";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { AktivitetType, IAktivitet } from "~/utils/aktivitettype.utils";
import { IRapporteringsperiodeStatus, KortType } from "~/utils/types";
import { valider } from "~/utils/validering.util";

function mockGetAppText(textId: string): string {
  return textId;
}

describe("validererAktiviteter", () => {
  test("skal validere OK tomme aktiviteter", () => {
    const aktiviteter: IAktivitet[] = [];

    const rapporteringsperiode = opprettRapporteringsperiode(aktiviteter);

    const valideringMeldinger = valider(rapporteringsperiode, mockGetAppText);

    expect(valideringMeldinger.length).toEqual(0);
  });

  test("skal validere OK Syk", () => {
    const aktiviteter: IAktivitet[] = [
      {
        id: uuidv7(),
        type: AktivitetType.Syk,
      },
    ];

    const rapporteringsperiode = opprettRapporteringsperiode(aktiviteter);

    const valideringMeldinger = valider(rapporteringsperiode, mockGetAppText);

    expect(valideringMeldinger.length).toEqual(0);
  });

  test("skal validere OK Fravaer", () => {
    const aktiviteter: IAktivitet[] = [
      {
        id: uuidv7(),
        type: AktivitetType.Fravaer,
      },
    ];

    const rapporteringsperiode = opprettRapporteringsperiode(aktiviteter);

    const valideringMeldinger = valider(rapporteringsperiode, mockGetAppText);

    expect(valideringMeldinger.length).toEqual(0);
  });

  test("skal validere OK Utdanning", () => {
    const aktiviteter: IAktivitet[] = [
      {
        id: uuidv7(),
        type: AktivitetType.Utdanning,
      },
    ];

    const rapporteringsperiode = opprettRapporteringsperiode(aktiviteter);

    const valideringMeldinger = valider(rapporteringsperiode, mockGetAppText);

    expect(valideringMeldinger.length).toEqual(0);
  });

  test("skal validere OK Arbeid", () => {
    const aktiviteter: IAktivitet[] = [
      {
        id: uuidv7(),
        type: AktivitetType.Arbeid,
        timer: "PT1H30M",
      },
    ];

    const rapporteringsperiode = opprettRapporteringsperiode(aktiviteter);

    const valideringMeldinger = valider(rapporteringsperiode, mockGetAppText);

    expect(valideringMeldinger.length).toEqual(0);
  });

  test("skal gi valideringsfeil når Arbeid og Syk er på samme dag", () => {
    const aktiviteter: IAktivitet[] = [
      {
        id: uuidv7(),
        type: AktivitetType.Arbeid,
        timer: "PT1H30M",
      },
      {
        id: uuidv7(),
        type: AktivitetType.Syk,
      },
    ];

    const rapporteringsperiode = opprettRapporteringsperiode(aktiviteter);

    const valideringMeldinger = valider(rapporteringsperiode, mockGetAppText);

    expect(valideringMeldinger.length).toEqual(14);
  });

  test("skal gi valideringsfeil når Arbeid og Fravaer er på samme dag", () => {
    const aktiviteter: IAktivitet[] = [
      {
        id: uuidv7(),
        type: AktivitetType.Arbeid,
        timer: "PT1H30M",
      },
      {
        id: uuidv7(),
        type: AktivitetType.Fravaer,
      },
    ];

    const rapporteringsperiode = opprettRapporteringsperiode(aktiviteter);

    const valideringMeldinger = valider(rapporteringsperiode, mockGetAppText);

    expect(valideringMeldinger.length).toEqual(14);
  });

  test("skal validere OK Arbeid og Utdanning", () => {
    const aktiviteter: IAktivitet[] = [
      {
        id: uuidv7(),
        type: AktivitetType.Arbeid,
        timer: "PT1H30M",
      },
      {
        id: uuidv7(),
        type: AktivitetType.Utdanning,
      },
    ];

    const rapporteringsperiode = opprettRapporteringsperiode(aktiviteter);

    const valideringMeldinger = valider(rapporteringsperiode, mockGetAppText);

    expect(valideringMeldinger.length).toEqual(0);
  });

  test("skal gi valideringsfeil når det finnes duplikater", () => {
    const aktiviteter: IAktivitet[] = [
      {
        id: uuidv7(),
        type: AktivitetType.Fravaer,
      },
      {
        id: uuidv7(),
        type: AktivitetType.Fravaer,
      },
    ];

    const rapporteringsperiode = opprettRapporteringsperiode(aktiviteter);

    const valideringMeldinger = valider(rapporteringsperiode, mockGetAppText);

    expect(valideringMeldinger.length).toEqual(14);
  });

  test("skal gi valideringsfeil når Arbeid ikke har timer", () => {
    const aktiviteter: IAktivitet[] = [
      {
        id: uuidv7(),
        type: AktivitetType.Arbeid,
        timer: undefined,
      },
    ];

    const rapporteringsperiode = opprettRapporteringsperiode(aktiviteter);

    const valideringMeldinger = valider(rapporteringsperiode, mockGetAppText);

    expect(valideringMeldinger.length).toEqual(14);
  });

  test("skal gi valideringsfeil når Arbeid har 0 timer og 0 minutter", () => {
    const aktiviteter: IAktivitet[] = [
      {
        id: uuidv7(),
        type: AktivitetType.Arbeid,
        timer: "PT0H0M",
      },
    ];

    const rapporteringsperiode = opprettRapporteringsperiode(aktiviteter);

    const valideringMeldinger = valider(rapporteringsperiode, mockGetAppText);

    expect(valideringMeldinger.length).toEqual(14);
  });

  test("skal gi valideringsfeil når Syk har timer", () => {
    const aktiviteter: IAktivitet[] = [
      {
        id: uuidv7(),
        type: AktivitetType.Syk,
        timer: "PT1H0M",
      },
    ];

    const rapporteringsperiode = opprettRapporteringsperiode(aktiviteter);

    const valideringMeldinger = valider(rapporteringsperiode, mockGetAppText);

    expect(valideringMeldinger.length).toEqual(14);
  });

  test("skal gi valideringsfeil når Arbeid har minutter som ikke er 0 eller 30", () => {
    const aktiviteter: IAktivitet[] = [
      {
        id: uuidv7(),
        type: AktivitetType.Arbeid,
        timer: "PT0H15M",
      },
    ];

    const rapporteringsperiode = opprettRapporteringsperiode(aktiviteter);

    const valideringMeldinger = valider(rapporteringsperiode, mockGetAppText);

    expect(valideringMeldinger.length).toEqual(14);
  });

  test("skal gi valideringsfeil når Arbeid har 24 timer og minutter > 0", () => {
    const aktiviteter: IAktivitet[] = [
      {
        id: uuidv7(),
        type: AktivitetType.Arbeid,
        timer: "PT24H15M",
      },
    ];

    const rapporteringsperiode = opprettRapporteringsperiode(aktiviteter);

    const valideringMeldinger = valider(rapporteringsperiode, mockGetAppText);

    expect(valideringMeldinger.length).toEqual(14);
  });

  test("skal validere OK Arbeid med 0 timer og 30 minutter", () => {
    const aktiviteter: IAktivitet[] = [
      {
        id: uuidv7(),
        type: AktivitetType.Arbeid,
        timer: "PT0H30M",
      },
    ];

    const rapporteringsperiode = opprettRapporteringsperiode(aktiviteter);

    const valideringMeldinger = valider(rapporteringsperiode, mockGetAppText);

    expect(valideringMeldinger.length).toEqual(0);
  });

  test("skal validere OK Arbeid med med timer og uten minutter", () => {
    const aktiviteter: IAktivitet[] = [
      {
        id: uuidv7(),
        type: AktivitetType.Arbeid,
        timer: "PT5H",
      },
    ];

    const rapporteringsperiode = opprettRapporteringsperiode(aktiviteter);

    const valideringMeldinger = valider(rapporteringsperiode, mockGetAppText);

    expect(valideringMeldinger.length).toEqual(0);
  });

  test("skal validere OK Arbeid med minutter og uten timer", () => {
    const aktiviteter: IAktivitet[] = [
      {
        id: uuidv7(),
        type: AktivitetType.Arbeid,
        timer: "PT30M",
      },
    ];

    const rapporteringsperiode = opprettRapporteringsperiode(aktiviteter);

    const valideringMeldinger = valider(rapporteringsperiode, mockGetAppText);

    expect(valideringMeldinger.length).toEqual(0);
  });
});

function opprettRapporteringsperiode(aktiviteter: IAktivitet[]): IRapporteringsperiode {
  const { fraOgMed, tilOgMed } = beregnNåværendePeriodeDato();

  return {
    id: uuidv7(),
    type: KortType.ORDINAERT,
    periode: {
      fraOgMed,
      tilOgMed,
    },
    dager: times(14, (i) => ({
      dagIndex: i,
      dato: "",
      aktiviteter,
    })),
    sisteFristForTrekk: null,
    kanSendesFra: "",
    kanSendes: true,
    kanEndres: true,
    bruttoBelop: null,
    begrunnelseEndring: "",
    status: IRapporteringsperiodeStatus.TilUtfylling,
    mottattDato: null,
    registrertArbeidssoker: null,
    originalId: null,
    html: null,
    rapporteringstype: null,
  };
}

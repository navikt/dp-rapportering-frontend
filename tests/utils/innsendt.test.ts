import { describe, expect, test } from "vitest";
import { sorterGrupper } from "~/utils/innsendt.utils";
import { innsendtRapporteringsperioderResponse } from "../../mocks/responses/innsendtRapporteringsperioderResponse";

describe("sorterAktiviteter", () => {
  test("to meldekort med ulik mottattDato skal sorteres synkende (nyeste først)", () => {
    const meldekort1 = { ...innsendtRapporteringsperioderResponse[0], mottattDato: "2021-01-01" };
    const meldekort2 = { ...innsendtRapporteringsperioderResponse[0], mottattDato: "2021-01-02" };

    const sorterte = sorterGrupper([meldekort1, meldekort2]);

    expect(sorterte).toEqual([meldekort2, meldekort1]);
  });

  test("to meldekort der én har originalId skal sorteres med originalId først", () => {
    const meldekort1 = {
      ...innsendtRapporteringsperioderResponse[0],
      mottattDato: "2021-01-01",
      id: "1",
    };

    const meldekort2 = {
      ...innsendtRapporteringsperioderResponse[0],
      mottattDato: "2021-01-01",
      id: "2",
      originalId: "1",
    };

    const sorterte = sorterGrupper([meldekort1, meldekort2]);

    expect(sorterte).toEqual([meldekort2, meldekort1]);
  });

  test("tre meldekort der to har originalId skal sorteres i rekkefølgen av originalId -> id", () => {
    const meldekort1 = {
      ...innsendtRapporteringsperioderResponse[0],
      mottattDato: "2021-01-01",
      id: "1",
    };

    const meldekort2 = {
      ...innsendtRapporteringsperioderResponse[0],
      mottattDato: "2021-01-01",
      id: "2",
      originalId: meldekort1.id,
    };

    const meldekort3 = {
      ...innsendtRapporteringsperioderResponse[0],
      mottattDato: "2021-01-01",
      id: "3",
      originalId: meldekort2.id,
    };

    const sorterte = sorterGrupper([meldekort1, meldekort2, meldekort3]);

    expect(sorterte).toEqual([meldekort3, meldekort2, meldekort1]);
  });

  test("tre meldekort der to har originalId og med ulike mottattDato skal sorteres i rekkefølgen av mottattDato og originalId -> id", () => {
    const meldekort1 = {
      ...innsendtRapporteringsperioderResponse[0],
      mottattDato: "2021-01-01",
      id: "1",
    };

    const meldekort2 = {
      ...innsendtRapporteringsperioderResponse[0],
      mottattDato: "2021-01-02",
      id: "2",
    };

    const meldekort3 = {
      ...innsendtRapporteringsperioderResponse[0],
      mottattDato: "2021-01-03",
      id: "3",
      originalId: meldekort1.id,
    };

    const sorterte = sorterGrupper([meldekort1, meldekort2, meldekort3]);

    expect(sorterte).toEqual([meldekort3, meldekort2, meldekort1]);
  });
});

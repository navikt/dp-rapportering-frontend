import { type IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { sorterOgStrukturerRapporteringsperiode } from "./rapporteringsperiode.utils";

describe("Sorter og formatter rappoteringspeperiode", () => {
  test("Sorter rapporteringsperiode på indeks og formatter slik at aktiviteter ligger på dagene", () => {
    const formatteringRapporteringsperiode = sorterOgStrukturerRapporteringsperiode(
      rapporteringsperiodeResponse
    );

    expect(formatteringRapporteringsperiode).toEqual(forventetRapporteringsperiode);
  });
});

const forventetRapporteringsperiode = {
  id: "2bbaa81d-6450-41da-9a85-ed2699a5fe27",
  fraOgMed: "2023-05-22",
  tilOgMed: "2023-06-04",
  status: "TilUtfylling",
  dager: [
    {
      dagIndex: 0,
      dato: "2023-05-22",
      muligeAktiviteter: ["Arbeid", "Syk", "Ferie"],
      aktiviteter: [
        {
          type: "Arbeid",
          dato: "2023-05-22",
          id: "490e5fb0-d478-4119-ae48-d4bc297b583c",
          timer: 7,
        },
      ],
    },
    {
      dagIndex: 1,
      dato: "2023-05-23",
      muligeAktiviteter: ["Arbeid", "Syk", "Ferie"],
      aktiviteter: [
        {
          type: "Arbeid",
          dato: "2023-05-23",
          id: "e6df1cde-3fc7-4c3e-a842-539286e46c48",
          timer: 7,
        },
      ],
    },
    {
      dagIndex: 2,
      dato: "2023-05-24",
      muligeAktiviteter: ["Arbeid", "Syk", "Ferie"],
      aktiviteter: [],
    },
    {
      dagIndex: 3,
      dato: "2023-05-25",
      muligeAktiviteter: ["Arbeid", "Syk", "Ferie"],
      aktiviteter: [],
    },
    {
      dagIndex: 4,
      dato: "2023-05-26",
      muligeAktiviteter: ["Arbeid", "Syk", "Ferie"],
      aktiviteter: [],
    },
    {
      dagIndex: 5,
      dato: "2023-05-27",
      muligeAktiviteter: ["Arbeid", "Syk", "Ferie"],
      aktiviteter: [],
    },
    {
      dagIndex: 6,
      dato: "2023-05-28",
      muligeAktiviteter: ["Arbeid", "Syk", "Ferie"],
      aktiviteter: [],
    },
    {
      dagIndex: 7,
      dato: "2023-05-29",
      muligeAktiviteter: ["Arbeid", "Syk", "Ferie"],
      aktiviteter: [],
    },
    {
      dagIndex: 8,
      dato: "2023-05-30",
      muligeAktiviteter: ["Arbeid", "Syk", "Ferie"],
      aktiviteter: [],
    },
    {
      dagIndex: 9,
      dato: "2023-05-31",
      muligeAktiviteter: ["Arbeid", "Syk", "Ferie"],
      aktiviteter: [],
    },
    {
      dagIndex: 10,
      dato: "2023-06-01",
      muligeAktiviteter: ["Arbeid", "Syk", "Ferie"],
      aktiviteter: [],
    },
    {
      dagIndex: 11,
      dato: "2023-06-02",
      muligeAktiviteter: ["Arbeid", "Syk", "Ferie"],
      aktiviteter: [],
    },
    {
      dagIndex: 12,
      dato: "2023-06-03",
      muligeAktiviteter: ["Arbeid", "Syk", "Ferie"],
      aktiviteter: [],
    },
    {
      dagIndex: 13,
      dato: "2023-06-04",
      muligeAktiviteter: ["Arbeid", "Syk", "Ferie"],
      aktiviteter: [],
    },
  ],
};

const rapporteringsperiodeResponse: IRapporteringsperiode = {
  id: "2bbaa81d-6450-41da-9a85-ed2699a5fe27",
  fraOgMed: "2023-05-22",
  tilOgMed: "2023-06-04",
  status: "TilUtfylling",
  dager: [
    { dagIndex: 12, dato: "2023-06-03", muligeAktiviteter: ["Arbeid", "Syk", "Ferie"] },
    { dagIndex: 0, dato: "2023-05-22", muligeAktiviteter: ["Arbeid", "Syk", "Ferie"] },
    { dagIndex: 1, dato: "2023-05-23", muligeAktiviteter: ["Arbeid", "Syk", "Ferie"] },
    { dagIndex: 2, dato: "2023-05-24", muligeAktiviteter: ["Arbeid", "Syk", "Ferie"] },
    { dagIndex: 3, dato: "2023-05-25", muligeAktiviteter: ["Arbeid", "Syk", "Ferie"] },
    { dagIndex: 4, dato: "2023-05-26", muligeAktiviteter: ["Arbeid", "Syk", "Ferie"] },
    { dagIndex: 5, dato: "2023-05-27", muligeAktiviteter: ["Arbeid", "Syk", "Ferie"] },
    { dagIndex: 6, dato: "2023-05-28", muligeAktiviteter: ["Arbeid", "Syk", "Ferie"] },
    { dagIndex: 7, dato: "2023-05-29", muligeAktiviteter: ["Arbeid", "Syk", "Ferie"] },
    { dagIndex: 8, dato: "2023-05-30", muligeAktiviteter: ["Arbeid", "Syk", "Ferie"] },
    { dagIndex: 9, dato: "2023-05-31", muligeAktiviteter: ["Arbeid", "Syk", "Ferie"] },
    { dagIndex: 10, dato: "2023-06-01", muligeAktiviteter: ["Arbeid", "Syk", "Ferie"] },
    { dagIndex: 11, dato: "2023-06-02", muligeAktiviteter: ["Arbeid", "Syk", "Ferie"] },
    { dagIndex: 13, dato: "2023-06-04", muligeAktiviteter: ["Arbeid", "Syk", "Ferie"] },
  ],
  aktiviteter: [
    {
      type: "Arbeid",
      dato: "2023-05-22",
      id: "490e5fb0-d478-4119-ae48-d4bc297b583c",
      timer: 7,
    },
    {
      type: "Arbeid",
      dato: "2023-05-23",
      id: "e6df1cde-3fc7-4c3e-a842-539286e46c48",
      timer: 7,
    },
  ],
};

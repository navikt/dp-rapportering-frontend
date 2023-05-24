import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { ARBEID, FERIE, SYK } from "~/utils/constants";

export const rapporteringsperioderResponse: IRapporteringsperiode[] = [
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    fraOgMed: "2023-05-01",
    tilOgMed: "2023-05-14",
    status: "TilUtfylling",
    dager: [
      {
        dagIndex: 0,
        dato: "2023-05-01",
        muligeAktiviteter: [ARBEID, SYK],
      },
      {
        dagIndex: 1,
        dato: "2023-05-02",
        muligeAktiviteter: [ARBEID, FERIE],
      },
      {
        dagIndex: 2,
        dato: "2023-05-03",
        muligeAktiviteter: [SYK],
      },
      {
        dagIndex: 3,
        dato: "2023-05-04",
        muligeAktiviteter: [FERIE, SYK],
      },
      {
        dagIndex: 4,
        dato: "2023-05-05",
        muligeAktiviteter: [ARBEID],
      },
      {
        dagIndex: 5,
        dato: "2023-05-06",
        muligeAktiviteter: [ARBEID],
      },
      {
        dagIndex: 6,
        dato: "2023-05-07",
        muligeAktiviteter: [ARBEID],
      },
      {
        dagIndex: 7,
        dato: "2023-05-08",
        muligeAktiviteter: [ARBEID],
      },
      {
        dagIndex: 8,
        dato: "2023-05-09",
        muligeAktiviteter: [ARBEID],
      },
      {
        dagIndex: 9,
        dato: "2023-05-10",
        muligeAktiviteter: [ARBEID],
      },
      {
        dagIndex: 10,
        dato: "2023-05-11",
        muligeAktiviteter: [ARBEID],
      },
      {
        dagIndex: 11,
        dato: "2023-05-12",
        muligeAktiviteter: [ARBEID],
      },
      {
        dagIndex: 12,
        dato: "2023-05-13",
        muligeAktiviteter: [ARBEID],
      },
      {
        dagIndex: 13,
        dato: "2023-05-14",
        muligeAktiviteter: [ARBEID],
      },
    ],
    aktiviteter: [
      {
        id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9a",
        type: ARBEID,
        timer: 5,
        dato: "2023-05-01",
      },
      {
        id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9b",
        type: ARBEID,
        timer: 7.5,
        dato: "2023-05-02",
      },
      {
        id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9c",
        type: FERIE,
        timer: 7.5,
        dato: "2023-05-03",
      },
      {
        id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9d",
        type: SYK,
        timer: 7.5,
        dato: "2023-05-04",
      },
      {
        id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9e",
        type: ARBEID,
        timer: 7.5,
        dato: "2023-05-05",
      },
    ],
  },
];

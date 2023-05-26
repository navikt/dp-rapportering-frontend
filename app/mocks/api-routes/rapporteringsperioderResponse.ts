import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

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
        muligeAktiviteter: ["Arbeid", "Syk"],
      },
      {
        dagIndex: 1,
        dato: "2023-05-02",
        muligeAktiviteter: ["Arbeid", "Ferie"],
      },
      {
        dagIndex: 2,
        dato: "2023-05-03",
        muligeAktiviteter: ["Syk"],
      },
      {
        dagIndex: 3,
        dato: "2023-05-04",
        muligeAktiviteter: ["Ferie", "Syk"],
      },
      {
        dagIndex: 4,
        dato: "2023-05-05",
        muligeAktiviteter: ["Arbeid"],
      },
      {
        dagIndex: 5,
        dato: "2023-05-06",
        muligeAktiviteter: ["Arbeid"],
      },
      {
        dagIndex: 6,
        dato: "2023-05-07",
        muligeAktiviteter: ["Arbeid"],
      },
      {
        dagIndex: 7,
        dato: "2023-05-08",
        muligeAktiviteter: ["Arbeid"],
      },
      {
        dagIndex: 8,
        dato: "2023-05-09",
        muligeAktiviteter: ["Arbeid"],
      },
      {
        dagIndex: 9,
        dato: "2023-05-10",
        muligeAktiviteter: ["Arbeid"],
      },
      {
        dagIndex: 10,
        dato: "2023-05-11",
        muligeAktiviteter: ["Arbeid"],
      },
      {
        dagIndex: 11,
        dato: "2023-05-12",
        muligeAktiviteter: ["Arbeid"],
      },
      {
        dagIndex: 12,
        dato: "2023-05-13",
        muligeAktiviteter: ["Arbeid"],
      },
      {
        dagIndex: 13,
        dato: "2023-05-14",
        muligeAktiviteter: ["Arbeid"],
      },
    ],
    aktiviteter: [
      {
        id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9a",
        type: "Arbeid",
        timer: 5,
        dato: "2023-05-01",
      },
      {
        id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9b",
        type: "Arbeid",
        timer: 7.5,
        dato: "2023-05-02",
      },
      {
        id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9c",
        type: "Ferie",
        timer: 7.5,
        dato: "2023-05-03",
      },
      {
        id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9d",
        type: "Syk",
        timer: 7.5,
        dato: "2023-05-04",
      },
      {
        id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9e",
        type: "Arbeid",
        timer: 7.5,
        dato: "2023-05-05",
      },
    ],
  },
];
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

export const rapporteringsperioderResponse: IRapporteringsperiode[] = [
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa3",
    periode: {
      fraOgMed: "2023-05-01",
      tilOgMed: "2023-05-14",
    },
    status: "Innsendt",
    kanSendesFra: "2023-05-13",
    kanSendes: false,
    kanKorrigeres: true,
    dager: [
      {
        dagIndex: 0,
        dato: "2023-05-01",
        aktiviteter: [],
      },
      {
        dagIndex: 1,
        dato: "2023-05-02",
        aktiviteter: [
          {
            id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9b",
            type: "Arbeid",
            timer: "PT5H30M",
          },
        ],
      },
      {
        dagIndex: 2,
        dato: "2023-05-03",
        aktiviteter: [
          {
            id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9c",
            type: "Syk",
          },
        ],
      },
      {
        dagIndex: 3,
        dato: "2023-05-04",
        aktiviteter: [
          {
            id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9d",
            type: "Syk",
          },
        ],
      },
      {
        dagIndex: 4,
        dato: "2023-05-05",
        aktiviteter: [
          {
            id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9e",
            type: "Arbeid",
            timer: "PT7H30M",
          },
        ],
      },
      {
        dagIndex: 5,
        dato: "2023-05-06",
        aktiviteter: [],
      },
      {
        dagIndex: 6,
        dato: "2023-05-07",
        aktiviteter: [],
      },
      {
        dagIndex: 7,
        dato: "2023-05-08",
        aktiviteter: [],
      },
      {
        dagIndex: 8,
        dato: "2023-05-09",
        aktiviteter: [],
      },
      {
        dagIndex: 9,
        dato: "2023-05-10",
        aktiviteter: [],
      },
      {
        dagIndex: 10,
        dato: "2023-05-11",
        aktiviteter: [],
      },
      {
        dagIndex: 11,
        dato: "2023-05-12",
        aktiviteter: [],
      },
      {
        dagIndex: 12,
        dato: "2023-05-13",
        aktiviteter: [
          {
            id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9e",
            type: "Syk",
          },
        ],
      },
      {
        dagIndex: 13,
        dato: "2023-05-14",
        aktiviteter: [],
      },
    ],
  },
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa4",
    periode: {
      fraOgMed: "2023-05-15",
      tilOgMed: "2023-05-28",
    },
    status: "Innsendt",
    kanSendesFra: "2023-05-27",
    kanSendes: false,
    kanKorrigeres: true,
    dager: [
      {
        dagIndex: 0,
        dato: "2023-05-15",
        aktiviteter: [],
      },
      {
        dagIndex: 1,
        dato: "2023-05-16",
        aktiviteter: [
          {
            id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9b",
            type: "Arbeid",
            timer: "PT5H30M",
          },
        ],
      },
      {
        dagIndex: 2,
        dato: "2023-05-17",
        aktiviteter: [
          {
            id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9c",
            type: "Syk",
          },
        ],
      },
      {
        dagIndex: 3,
        dato: "2023-05-18",
        aktiviteter: [
          {
            id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9d",
            type: "Syk",
          },
        ],
      },
      {
        dagIndex: 4,
        dato: "2023-05-19",
        aktiviteter: [
          {
            id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9e",
            type: "Arbeid",
            timer: "PT6H0M",
          },
        ],
      },
      {
        dagIndex: 5,
        dato: "2023-05-20",
        aktiviteter: [],
      },
      {
        dagIndex: 6,
        dato: "2023-05-21",
        aktiviteter: [],
      },
      {
        dagIndex: 7,
        dato: "2023-05-22",
        aktiviteter: [],
      },
      {
        dagIndex: 8,
        dato: "2023-05-23",
        aktiviteter: [],
      },
      {
        dagIndex: 9,
        dato: "2023-05-24",
        aktiviteter: [],
      },
      {
        dagIndex: 10,
        dato: "2023-05-25",
        aktiviteter: [],
      },
      {
        dagIndex: 11,
        dato: "2023-05-26",
        aktiviteter: [],
      },
      {
        dagIndex: 12,
        dato: "2023-05-27",
        aktiviteter: [
          {
            id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9e",
            type: "Arbeid",
            timer: "PT4H30M",
          },
        ],
      },
      {
        dagIndex: 13,
        dato: "2023-05-28",
        aktiviteter: [
          {
            id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9f",
            type: "Fravaer",
          },
        ],
      },
    ],
  },
];

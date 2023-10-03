import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

export const gjeldendePeriodeResponse: IRapporteringsperiode = {
  beregnesEtter: "2023-05-01",
  id: "3fa85f64-5717-4562-b3fc-2c963f66afa3",
  fraOgMed: "2023-05-01",
  tilOgMed: "2023-05-14",
  kanGodkjennesFra: "2023-05-13",
  status: "TilUtfylling",
  dager: [
    {
      dagIndex: 0,
      dato: "2023-05-01",
      muligeAktiviteter: ["Arbeid", "Syk"],
      aktiviteter: [
        {
          id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9a",
          type: "Arbeid",
          timer: "PT5H",
          dato: "2023-05-01",
        },
        {
          id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9a",
          type: "Arbeid",
          timer: "PT5H",
          dato: "2023-05-01",
        },
      ],
    },
    {
      dagIndex: 1,
      dato: "2023-05-02",
      muligeAktiviteter: ["Arbeid", "Ferie"],
      aktiviteter: [
        {
          id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9b",
          type: "Arbeid",
          timer: "PT5H30M",
          dato: "2023-05-02",
        },
      ],
    },
    {
      dagIndex: 2,
      dato: "2023-05-03",
      muligeAktiviteter: ["Syk"],
      aktiviteter: [
        {
          id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9c",
          type: "Ferie",
          dato: "2023-05-03",
        },
      ],
    },
    {
      dagIndex: 3,
      dato: "2023-05-04",
      muligeAktiviteter: ["Ferie", "Syk"],
      aktiviteter: [
        {
          id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9d",
          type: "Syk",
          dato: "2023-05-04",
        },
      ],
    },
    {
      dagIndex: 4,
      dato: "2023-05-05",
      muligeAktiviteter: ["Arbeid"],
      aktiviteter: [
        {
          id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9e",
          type: "Arbeid",
          timer: "PT7H30M",
          dato: "2023-05-05",
        },
      ],
    },
    {
      dagIndex: 5,
      dato: "2023-05-06",
      muligeAktiviteter: ["Arbeid"],
      aktiviteter: [],
    },
    {
      dagIndex: 6,
      dato: "2023-05-07",
      muligeAktiviteter: ["Arbeid"],
      aktiviteter: [],
    },
    {
      dagIndex: 7,
      dato: "2023-05-08",
      muligeAktiviteter: ["Arbeid"],
      aktiviteter: [],
    },
    {
      dagIndex: 8,
      dato: "2023-05-09",
      muligeAktiviteter: ["Arbeid"],
      aktiviteter: [],
    },
    {
      dagIndex: 9,
      dato: "2023-05-10",
      muligeAktiviteter: ["Arbeid"],
      aktiviteter: [],
    },
    {
      dagIndex: 10,
      dato: "2023-05-11",
      muligeAktiviteter: ["Arbeid"],
      aktiviteter: [],
    },
    {
      dagIndex: 11,
      dato: "2023-05-12",
      muligeAktiviteter: ["Arbeid"],
      aktiviteter: [],
    },
    {
      dagIndex: 12,
      dato: "2023-05-13",
      muligeAktiviteter: ["Arbeid", "Syk"],
      aktiviteter: [
        {
          id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9e",
          type: "Syk",
          dato: "2023-05-13",
        },
      ],
    },
    {
      dagIndex: 13,
      dato: "2023-05-14",
      muligeAktiviteter: ["Arbeid"],
      aktiviteter: [],
    },
  ],
};

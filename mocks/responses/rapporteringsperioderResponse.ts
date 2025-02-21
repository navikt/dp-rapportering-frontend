import { type IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { IRapporteringsperiodeStatus, KortType } from "~/utils/types";

export const rapporteringsperioderResponse: IRapporteringsperiode[] = [
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa9",
    type: KortType.ELEKTRONISK,
    periode: {
      fraOgMed: "2023-05-01",
      tilOgMed: "2023-05-14",
    },
    dager: [
      {
        dagIndex: 0,
        dato: "2023-05-01",
        aktiviteter: [],
      },
      {
        dagIndex: 1,
        dato: "2023-05-02",
        aktiviteter: [],
      },
      {
        dagIndex: 2,
        dato: "2023-05-03",
        aktiviteter: [],
      },
      {
        dagIndex: 3,
        dato: "2023-05-04",
        aktiviteter: [],
      },
      {
        dagIndex: 4,
        dato: "2023-05-05",
        aktiviteter: [],
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
        aktiviteter: [],
      },
      {
        dagIndex: 13,
        dato: "2023-05-14",
        aktiviteter: [],
      },
    ],
    sisteFristForTrekk: "2023-05-20",
    kanSendesFra: "2023-05-13",
    kanSendes: true,
    kanEndres: true,
    bruttoBelop: null,
    begrunnelseEndring: null,
    status: IRapporteringsperiodeStatus.TilUtfylling,
    mottattDato: null,
    registrertArbeidssoker: false,
    originalId: null,
    html: null,
    rapporteringstype: null,
  },
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa4",
    type: KortType.ELEKTRONISK,
    periode: {
      fraOgMed: "2023-05-15",
      tilOgMed: "2023-05-28",
    },
    dager: [
      {
        dagIndex: 0,
        dato: "2023-05-15",
        aktiviteter: [],
      },
      {
        dagIndex: 1,
        dato: "2023-05-16",
        aktiviteter: [],
      },
      {
        dagIndex: 2,
        dato: "2023-05-17",
        aktiviteter: [],
      },
      {
        dagIndex: 3,
        dato: "2023-05-18",
        aktiviteter: [],
      },
      {
        dagIndex: 4,
        dato: "2023-05-19",
        aktiviteter: [],
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
        aktiviteter: [],
      },
      {
        dagIndex: 13,
        dato: "2023-05-28",
        aktiviteter: [],
      },
    ],
    sisteFristForTrekk: "2023-06-03",
    kanSendesFra: "2023-05-27",
    kanSendes: false,
    kanEndres: true,
    bruttoBelop: null,
    begrunnelseEndring: null,
    status: IRapporteringsperiodeStatus.Innsendt,
    mottattDato: "2023-05-28",
    registrertArbeidssoker: null,
    originalId: null,
    html: null,
    rapporteringstype: null,
  },
];

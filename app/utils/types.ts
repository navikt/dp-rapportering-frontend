export type INetworkResponse<T = void> = INetworkResponseSuccess<T> | INetworkResponseError;

interface INetworkResponseSuccess<T> {
  status: "success";
  data?: T;
  id?: string;
}

interface INetworkResponseError {
  status: "error";
  error: {
    statusCode: number;
    statusText: string;
  };
  id?: string;
}

export enum Rapporteringstype {
  harAktivitet = "harAktivitet",
  harIngenAktivitet = "harIngenAktivitet",
}

export enum IRapporteringsperiodeStatus {
  TilUtfylling = "TilUtfylling",
  Innsendt = "Innsendt",
  Endret = "Endret",
  Ferdig = "Ferdig",
  Feilet = "Feilet",
}

export interface IHttpProblem {
  type: string;
  title: string;
  status?: number;
  detail?: string;
  instance: string;
  errorType?: string;
  correlationId: string;
}

export const KortType = {
  ORDINAERT: "Ordinaert",
  ETTERREGISTRERT: "Etterregistrert",
  KORRIGERT: "Korrigert",
} as const;

export const ARBEIDSSOKERSTATUS_AARSAK = {
  KORRIGERT_MELDEKORT: "KORRIGERT_MELDEKORT",
  ETTERREGISTRERT_MELDEKORT: "ETTERREGISTRERT_MELDEKORT",
  DAGPENGER_HAR_IKKE_ANSVAR_FOR_SPORSMAL_OM_ARBEIDSSOKERSTATUS:
    "DAGPENGER_HAR_IKKE_ANSVAR_FOR_SPØRSMÅL_OM_ARBEIDSSØKERSTATUS",
  ARBEIDSSOKERPERIODEN_ER_I_FORTID: "ARBEIDSSØKERPERIODEN_ER_I_FORTID",
  UKJENT_AARSAK_MELDEKORTET_ER_MIGRERT_FRA_ARENA: "UKJENT_ÅRSAK_MELDEKORTET_ER_MIGRERT_FRA_ARENA",
} as const;

export type ArbeidssokerstatusAarsak =
  (typeof ARBEIDSSOKERSTATUS_AARSAK)[keyof typeof ARBEIDSSOKERSTATUS_AARSAK];

export const TIDSSONER = {
  OSLO: "Europe/Oslo",
};

export const OPPRETTET_AV = {
  Arena: "Arena",
  Dagpenger: "Dagpenger",
} as const;

export type TOpprettetAv = (typeof OPPRETTET_AV)[keyof typeof OPPRETTET_AV];

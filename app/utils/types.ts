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
  ORDINAER: "01",
  ERSTATNING: "03",
  RETUR: "04",
  ELEKTRONISK: "05",
  AAP: "06",
  ORDINAER_MANUELL: "07",
  MASKINELT_OPPDATERT: "08",
  MANUELL_ARENA: "09",
  KORRIGERT_ELEKTRONISK: "10",
} as const;

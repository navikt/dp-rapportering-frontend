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

export interface IHttpProblem {
  type: string;
  title: string;
  status?: number;
  detail?: string;
  instance: string;
  errorType?: string;
  correlationId: string;
}

export type INetworkResponse<T = void> = INetworkResponseSuccess<T> | INetworkResponseError;

export interface INetworkResponseSuccess<T> {
  status: "success";
  data: T;
}

export interface INetworkResponseError {
  status: "error";
  error: {
    statusCode: number;
    statusText: string;
  };
}

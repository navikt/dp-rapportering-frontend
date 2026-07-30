import winston from "winston";

import { IHttpProblem } from "~/utils/types";

export interface IErrorResponse {
  status: number;
  body: IHttpProblem | null;
  correlationId: string | undefined;
}

export const logger = winston.createLogger({
  format: process.env.NODE_ENV === "development" ? winston.format.simple() : winston.format.json(),
  transports: new winston.transports.Console(),
});

export const sikkerLogger = winston.createLogger({
  format: process.env.NODE_ENV === "development" ? winston.format.simple() : winston.format.json(),
  defaultMeta: {
    google_cloud_project: process.env.GOOGLE_CLOUD_PROJECT,
    nais_namespace_name: process.env.NAIS_NAMESPACE,
    nais_pod_name: process.env.NAIS_POD_NAME,
    nais_container_name: process.env.NAIS_APP_NAME,
  },
  transports:
    process.env.NODE_ENV === "development"
      ? new winston.transports.Console()
      : [
          new winston.transports.Http({
            host: "team-logs.nais-system",
            ssl: false,
            handleExceptions: true,
            handleRejections: true,
          }),
        ],
});

export async function getErrorResponse(response: Response): Promise<IErrorResponse> {
  const body = await getHttpProblem(response);
  return {
    status: response.status,
    body,
    correlationId: getCorrelationId(response, body) ?? undefined,
  };
}

export function logErrorResponse(
  errorResponse: IErrorResponse,
  message: string,
  level: "error" | "warn" = "error",
): void {
  logg({
    type: level,
    message: `Feil i response fra backend. ${message}. Status: ${errorResponse.status}.`,
    correlationId: errorResponse.correlationId ?? null,
    body: errorResponse.body,
  });
}

function getCorrelationId(response: Response, body: IHttpProblem | null): string | null {
  return (
    body?.correlationId ??
    response.headers.get("x-request-id") ??
    response.headers.get("x_correlation-id") ??
    null
  );
}

async function getHttpProblem(response: Response): Promise<IHttpProblem | null> {
  try {
    return await response.json();
  } catch (e: unknown) {
    logger.error(`Klarte ikke å lese body ${e}`);
    return null;
  }
}

export async function logg({
  type,
  message,
  correlationId = null,
  body,
}: {
  type: "error" | "warn" | "info" | "debug";
  message: string;
  correlationId: string | null;
  body: unknown;
}) {
  sikkerLogger[type](`${message}, body: ${JSON.stringify(body)}`, {
    x_correlationId: correlationId,
  });
  logger[type](`${message}. Se sikker logg for data.`, { x_correlationId: correlationId });
}

import winston from "winston";

import { IHttpProblem } from "~/utils/types";

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

export async function logErrorResponse(errorResponse: Response, message?: string) {
  const body = await getHttpProblem(errorResponse);
  sikkerLogger.error(
    `Feil i response fra backend. ${message}. URL: ${errorResponse.url}, Status: ${errorResponse.status}, body: ${JSON.stringify(body)}`,
    { x_correlationId: body?.correlationId },
  );
  logger.error(
    `Feil i response fra backend. ${message}. Status: ${errorResponse.status}. Se sikker logg for response body.`,
    { x_correlationId: body?.correlationId },
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

import fs from "fs";
import winston from "winston";
import { IHttpProblem } from "~/utils/types";

const sikkerLogPath = () =>
  fs.existsSync("/secure-logs/") ? "/secure-logs/secure.log" : "./secure.log";
export const logger = winston.createLogger({
  format: process.env.NODE_ENV === "development" ? winston.format.simple() : winston.format.json(),
  transports: new winston.transports.Console(),
});

export const sikkerLogger = winston.createLogger({
  format: process.env.NODE_ENV === "development" ? winston.format.simple() : winston.format.json(),
  transports:
    process.env.NODE_ENV === "development"
      ? new winston.transports.Console()
      : [
          new winston.transports.File({
            filename: sikkerLogPath(),
            maxsize: 5242880,
            maxFiles: 10,
          }),
        ],
});

export async function logErrorResponse(errorResponse: Response, message?: string) {
  const body = await getHttpProblem(errorResponse);
  sikkerLogger.error(
    `Feil i response fra backend. ${message}. URL: ${errorResponse.url}, Status: ${errorResponse.status}, body: ${JSON.stringify(body)}`,
    { x_correlationId: body?.correlationId }
  );
  logger.error(
    `Feil i response fra backend. ${message}. Status: ${errorResponse.status}. Se sikker logg for response body.`,
    { x_correlationId: body?.correlationId }
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

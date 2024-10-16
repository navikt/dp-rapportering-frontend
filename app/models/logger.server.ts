import fs from "fs";
import winston from "winston";
import { IHttpProblem } from "~/utils/types";

const MDC_CORRELATION_ID = "x_correlationId";

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
  const correlationId = await getCorrelationId(errorResponse);
  const logMap = new Map();
  if (correlationId) {
    logMap.set(MDC_CORRELATION_ID, correlationId);
  }
  sikkerLogger.error(
    `Feil i response fra backend. ${message}. URL: ${errorResponse.url}, Status: ${errorResponse.status}, body: ${body}`,
    logMap
  );
  logger.error(
    `Feil i response fra backend. ${message}. Status: ${errorResponse.status}. Se sikker logg for response body.`,
    logMap
  );
}

async function getHttpProblem(response: Response): Promise<string | null> {
  try {
    return await response.text();
  } catch (e: unknown) {
    logger.error(`Klarte ikke å lese body ${e}`);
    return null;
  }
}

async function getCorrelationId(errorResponse: Response) {
  try {
    const errorBody: IHttpProblem = await errorResponse.json();
    if (errorBody && errorBody.correlationId) {
      return errorBody.correlationId;
    }
  } catch {
    return "";
  }
}

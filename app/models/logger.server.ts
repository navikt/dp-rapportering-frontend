import fs from "fs";
import winston from "winston";

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
  let body = null;
  try {
    body = await errorResponse.text();
  } catch (e: unknown) {
    logger.error(`Klarte ikke å lese body ${e}`);
    body = null;
  }
  sikkerLogger.error(
    `Feil i response fra backend. ${message}. URL: ${errorResponse.url}, Status: ${errorResponse.status}, body: ${body}`
  );
  logger.error(
    `Feil i response fra backend. ${message}. Status: ${errorResponse.status}. Se sikker logg for response body.`
  );
}

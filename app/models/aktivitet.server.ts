import { IRapporteringsperiodeDag } from "./rapporteringsperiode.server";
import { logger, sikkerLogger } from "~/models/logger.server";
import { aktivitetType } from "~/utils/aktivitettype.utils";
import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import type { INetworkResponse } from "~/utils/types";

export type AktivitetType = (typeof aktivitetType)[number];

export interface IAktivitet {
  id?: string;
  type: AktivitetType;
  timer?: string;
}

export async function lagreAktivitet(
  request: Request,
  rapporteringsperiodeId: string,
  dag: IRapporteringsperiodeDag
): Promise<INetworkResponse> {
  const url = `${getEnv(
    "DP_RAPPORTERING_URL"
  )}/rapporteringsperiode/${rapporteringsperiodeId}/aktivitet`;

  logger.info(
    `Lagrer aktivitet for rapporteringsperiode ${rapporteringsperiodeId} og dag ${dag.dato}`
  );
  sikkerLogger.info(
    `Tester sikker logg ved lagring av aktivitet ${rapporteringsperiodeId} og dag ${dag.dato}`
  );

  const response = await fetch(url, {
    method: "POST",
    headers: await getHeaders(request),
    body: JSON.stringify({ ...dag }),
  });

  if (!response.ok) {
    logger.error(
      `Klarte ikke å lagre aktivitet. Status: ${response.status}, body: ${await response.text()}`
    );
    return {
      status: "error",
      error: {
        statusCode: response.status,
        statusText: `rapportering-feilmelding-lagre-aktivitet`,
      },
    };
  }

  return { status: "success" };
}

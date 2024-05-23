import { type Faro, getWebInstrumentations, initializeFaro } from "@grafana/faro-web-sdk";
import { getEnv } from "~/utils/env.utils";

let faro: Faro | null = null;

export function initInstrumentation(): void {
  if (typeof window === "undefined" || faro !== null) return;

  getFaro();
}

export function getFaro(): Faro | null {
  if (faro != null) return faro;
  faro = initializeFaro({
    url: getEnv("FARO_URL"), // required, see below
    app: {
      name: "dp-rapportering-frontend", // required
      version: "0.1", // optional; useful in Grafana to get diff between versions
    },
    instrumentations: [
      ...getWebInstrumentations({
        captureConsole: true,
      }),
    ],
  });
  return faro;
}

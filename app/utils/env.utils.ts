declare global {
  interface Window {
    env: IEnv;
  }
}

interface IEnv {
  BASE_PATH: string;
  DP_RAPPORTERING_URL: string;
  IS_LOCALHOST: string;
  DP_RAPPORTERING_TOKEN: string;
  NAIS_CLUSTER_NAME: string;
  USE_MSW: string;
  GITHUB_SHA: string;
  FARO_URL: string;
  DEKORATOR_ENV: string;
  RUNTIME_ENVIRONMENT: string;
  SANITY_DATASETT: string;
  FELLES_MELDEKORT_URL: string;
}

export function getEnv(value: keyof IEnv) {
  const env = typeof window !== "undefined" ? window.env : process.env;

  return env[value] || "";
}

export const DP_RAPPORTERING_URL = getEnv("DP_RAPPORTERING_URL");

export const isLocalhost = getEnv("IS_LOCALHOST") === "true";

export const isLocalOrDemo =
  getEnv("RUNTIME_ENVIRONMENT") === "demo" || getEnv("USE_MSW") === "true";

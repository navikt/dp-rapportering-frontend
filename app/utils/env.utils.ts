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
  NAIS_APP_IMAGE: string;
  COMMIT: string;
}

export function getEnv(value: keyof IEnv) {
  const env = typeof window !== "undefined" ? window.env : process.env;

  return env[value] || "";
}

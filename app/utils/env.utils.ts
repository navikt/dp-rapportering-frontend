declare global {
  interface Window {
    env: IEnv;
  }
}

interface IEnv {
  BASE_PATH: string;
  DP_RAPPORTERING_URL: string;
  AUTH_PROVIDER: string;
  IS_LOCALHOST: string;
  NAIS_CLUSTER_NAME: string;
  LOCAL_TOKEN: string;
  USE_MSW: string;
}

export function getEnv(value: keyof IEnv) {
  const env = typeof window !== "undefined" ? window.env : process.env;

  return env[value] || "";
}

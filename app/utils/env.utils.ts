declare global {
  interface Window {
    env: IEnv;
  }
}

interface IEnv {
  BASE_PATH: string;
  DP_RAPPORTERING_URL: string;
  IS_LOCALHOST: string;
  USE_MSW: string;
}

export function getEnv(value: keyof IEnv) {
  const env = typeof window !== 'undefined' ? window.env : process.env;

  return env[value] || '';
}

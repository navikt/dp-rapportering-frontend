import { getEnv } from '~/utils/env.utils';

interface IAktivietet {
  id?: string;
  type: 'arbeid' | 'sykdom' | 'ferie';
  hours: number;
  date: string;
}

export async function hentAktivitet(): Promise<IAktivietet> {
  const url = `${getEnv('DP_RAPPORTERING_URL')}/aktivitet`;

  console.log('rapportering url', url);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Response(`Feil ved kall til ${url}`, {
      status: response.status,
      statusText: response.statusText,
    });
  }

  return await response.json();
}

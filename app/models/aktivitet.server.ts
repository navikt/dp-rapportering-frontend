import { getEnv } from "~/utils/env.utils";

//kan ikke bruke konstanter som en type... så får ikke brukt constants.ts her
export type TAktivitetType = "Arbeid" | "Syk" | "Ferie";

export interface IAktivitet {
  id?: string;
  type: TAktivitetType;
  timer: number;
  dato: string;
}

export async function lagreAktivitet(
  aktivitet: IAktivitet
): Promise<IAktivitet> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/aktivitet`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aktivitet }),
  });

  if (!response.ok) {
    throw new Response(`Feil ved kall til ${url}`, {
      status: response.status,
      statusText: response.statusText,
    });
  }

  return await response.json();
}

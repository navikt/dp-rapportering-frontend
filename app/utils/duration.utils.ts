import { serialize } from "tinyduration";

export function hentISO8601DurationString(varighet: string): string {
  const delt = varighet.trim().replace(/\./g, ",").split(",");
  const timer = delt[0] || 0;
  const minutter = delt[1] || 0;
  const minutterProsent = parseFloat(`0.${minutter}`);

  return serialize({
    hours: timer as number,
    minutes: Math.round(minutterProsent * 60),
  });
}

import { parse } from "tinyduration";

export function periodeSomTimer(periode: string) {
  const parsed = parse(periode);
  const timer = parsed.hours || 0;
  const minutt = parsed.minutes || 0;
  return timer + minutt / 60;
}

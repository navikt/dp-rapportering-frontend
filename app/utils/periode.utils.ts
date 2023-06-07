import { parse } from "tinyduration";

export function periodeSomTimer(periode: string) {
  const parsed = parse(periode);
  const timer = parsed.hours || 0;
  const minutt = parsed.minutes || 0;
  return timer + minutt / 60;
}

export function leggSammenPeriode(
  periode1: Duration | string,
  periode2: Duration | string
): Duration {
  periode1 = asPeriod(periode1);
  periode2 = asPeriod(periode2);

  const resultat: Duration = {};

  resultat.years = (periode1.years || 0) + (periode2.years || 0);
  resultat.months = (periode1.months || 0) + (periode2.months || 0);
  resultat.weeks = (periode1.weeks || 0) + (periode2.weeks || 0);
  resultat.days = (periode1.days || 0) + (periode2.days || 0);

  // Legg sammen timer, minutter og sekunder samtidig som vi håndterer overflyt
  let minutter = (periode1.minutes || 0) + (periode2.minutes || 0);
  let sekunder = (periode1.seconds || 0) + (periode2.seconds || 0);

  if (sekunder >= 60) {
    const ekstraMinutter = Math.floor(sekunder / 60);
    minutter += ekstraMinutter;
    sekunder %= 60;
  }

  if (minutter >= 60) {
    const ekstraTimer = Math.floor(minutter / 60);
    resultat.hours = (periode1.hours || 0) + (periode2.hours || 0) + ekstraTimer;
    resultat.minutes = minutter % 60;
  } else {
    resultat.hours = (periode1.hours || 0) + (periode2.hours || 0);
    resultat.minutes = minutter;
  }

  resultat.seconds = sekunder;

  return resultat;
}

export function asPeriod(periode: Duration | string): Duration {
  if (typeof periode == "string") {
    return parse(periode);
  }

  return periode;
}

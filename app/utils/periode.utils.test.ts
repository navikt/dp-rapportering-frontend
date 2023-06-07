import { asPeriod, leggSammenPeriode, periodeSomTimer } from "./periode.utils";

describe("periodeSomTimer", () => {
  test("skal returnere riktig antall timer for en gyldig periode-streng", () => {
    expect(periodeSomTimer("PT2H30M")).toBe(2.5);
  });

  test("skal kaste error hvis periode-strengen er ugyldig", () => {
    expect(() => periodeSomTimer("ugyldig-periode")).toThrow("Invalid duration");
  });
});

describe("leggSammenPeriode", () => {
  test("skal korrekt legge sammen to perioder", () => {
    const periode1 = { hours: 1, minutes: 30 };
    const periode2 = { hours: 1, minutes: 45 };
    const forventetSum = { hours: 3, minutes: 15 };

    expect(leggSammenPeriode(periode1, periode2)).toMatchObject(forventetSum);
  });

  test("skal håndtere manglende egenskaper ved å sette standardverdi til 0", () => {
    const periode1 = { hours: 2 };
    const periode2 = { minutes: 30 };
    const forventetSum = { hours: 2, minutes: 30 };

    expect(leggSammenPeriode(periode1, periode2)).toMatchObject(forventetSum);
  });
});

describe("asPeriod", () => {
  test("skal returnere det samme objektet hvis input allerede er en periode", () => {
    const periode = { hours: 2, minutes: 30 };

    expect(asPeriod(periode)).toBe(periode);
  });

  test("skal analysere den gitte strengen til et periode-objekt", () => {
    const periodeStreng = "PT2H30M";
    const forventetPeriode = { hours: 2, minutes: 30 };

    expect(asPeriod(periodeStreng)).toEqual(forventetPeriode);
  });
});

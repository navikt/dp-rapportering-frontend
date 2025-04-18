import { describe, expect, it } from "vitest";

import { hentSkjermleserDatoTekst } from "~/components/kalender/kalender.utils";
import { aktivitetType } from "~/utils/aktivitettype.utils";

const ingenAktiviteter = {
  dagIndex: 0,
  dato: "2024-09-09",
  aktiviteter: [],
};

const syk = {
  dagIndex: 0,
  dato: "2024-09-09",
  aktiviteter: [
    {
      id: "019227ba-59fc-7a89-9ee0-5b106b53bbdb",
      type: aktivitetType[1],
      dato: "2024-09-09",
    },
  ],
};

const sykOgUtdanning = {
  dagIndex: 13,
  dato: "2024-09-22",
  aktiviteter: [
    {
      id: "019227bc-64d5-716a-8c3f-bfe758336f0e",
      type: aktivitetType[1],
      dato: "2024-09-22",
    },
    {
      id: "019227bc-64d5-716a-8c3f-bfe834d95070",
      type: aktivitetType[3],
      dato: "2024-09-22",
    },
  ],
};

const arbeidOgUtdanning = {
  dagIndex: 13,
  dato: "2024-09-22",
  aktiviteter: [
    {
      id: "019227bc-64d5-716a-8c3f-bfe834d95070",
      type: aktivitetType[3],
      dato: "2024-09-22",
    },
    {
      id: "019227bc-e15c-7603-bd10-fbded3aa5785",
      type: aktivitetType[0],
      dato: "2024-09-22",
      timer: "PT5H",
    },
  ],
};

function mockGetAppText(textId: string) {
  return textId;
}

describe("hentSkjermleserDatoTekst", () => {
  it("skal vise tekst for ingen aktiviteter", () => {
    const tekst = hentSkjermleserDatoTekst(ingenAktiviteter, mockGetAppText);
    expect(tekst).toBe("mandag 9. september");
  });

  it("skal vise tekst for én aktivitet", () => {
    const tekst = hentSkjermleserDatoTekst(syk, mockGetAppText);
    expect(tekst).toBe("mandag 9. september, Syk 1 rapportering-dag");
  });

  it("skal vise tekst for to aktiviteter", () => {
    const tekst = hentSkjermleserDatoTekst(sykOgUtdanning, mockGetAppText);
    expect(tekst).toBe(
      "søndag 22. september, Syk 1 rapportering-dag og Utdanning 1 rapportering-dag",
    );
  });

  it("skal vise tekst for én aktivitet heldag og én aktivitet med timer", () => {
    const tekst = hentSkjermleserDatoTekst(arbeidOgUtdanning, mockGetAppText);
    expect(tekst).toBe(
      "søndag 22. september, Utdanning 1 rapportering-dag og Arbeid 5 rapportering-timer",
    );
  });
});

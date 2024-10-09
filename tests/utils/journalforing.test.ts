import { TypedObject } from "@portabletext/types";
import { describe, expect, it } from "vitest";
// import { aktivitetType } from "~/utils/aktivitettype.utils";
import { DecoratorLocale } from "~/utils/dekoratoren.utils";
import {
  getAktivitet,
  getAktivitetCheckbox,
  getAktivitetModal,
  getArbeidssokerAlert,
  getDag,
  getHeader,
  getLesMer, //   htmlForLandingsside,
  //   samleHtmlForPeriode,
} from "~/utils/journalforing.utils";
import { createSanityRichTextObject } from "~/hooks/useSanity";
import { innsendtRapporteringsperioderResponse } from "../../mocks/responses/innsendtRapporteringsperioderResponse";

function mockGetAppText(textId: string): string {
  return textId;
}

function mockGetRichText(textId: string): TypedObject | TypedObject[] {
  return createSanityRichTextObject(textId);
}

const locale = DecoratorLocale.NB;

describe("getArbeidssokerAlert", () => {
  const periode = innsendtRapporteringsperioderResponse[0];

  it("viser alert for arbeidssøker", () => {
    const alert = getArbeidssokerAlert(periode, mockGetAppText, mockGetRichText);
    expect(alert).toContain("rapportering-arbeidssokerregister-alert-tittel-registrert");
  });

  it("viser alert for avregistrering av arbeidssøker", () => {
    const alert = getArbeidssokerAlert(
      { ...periode, registrertArbeidssoker: false },
      mockGetAppText,
      mockGetRichText
    );
    expect(alert).toContain("rapportering-arbeidssokerregister-alert-tittel-avregistrert");
    expect(alert).toContain("rapportering-arbeidssokerregister-alert-innhold-avregistrert");
  });
});

describe("getHeader", () => {
  it("viser header med rett nivå og tekst", () => {
    const header = getHeader({ text: "rapportering-overskrift", level: "2" });
    expect(header).toContain("rapportering-overskrift");
    expect(header).toContain("<h2>");
  });
});

describe("getLesMer", () => {
  const periode = innsendtRapporteringsperioderResponse[0];

  it("viser les mer", () => {
    const lesMer = getLesMer({
      rapporteringsperioder: [],
      periode,
      locale,
      getAppText: mockGetAppText,
      getRichText: mockGetRichText,
    });
    expect(lesMer).toContain("rapportering-les-mer-hva-skal-rapporteres-innhold");
  });
});

describe("getAktivitetCheckbox", () => {
  it("viser checkbox for arbeid", () => {
    const checkbox = getAktivitetCheckbox("Arbeid", mockGetAppText, mockGetRichText);
    expect(checkbox).toContain("<h2>rapportering-arbeid</h2>");
    expect(checkbox).toContain("<h3>rapportering-antall-timer</h3>");
  });

  it("viser checkbox for annen aktivitet", () => {
    const checkbox = getAktivitetCheckbox("Utdanning", mockGetAppText, mockGetRichText);
    expect(checkbox).toContain("<h2>rapportering-utdanning</h2>");
  });
});

describe("getAktivitetModal", () => {
  const periode = innsendtRapporteringsperioderResponse[0];
  it("viser modal", () => {
    const modal = getAktivitetModal({
      rapporteringsperioder: [],
      periode,
      locale,
      getAppText: mockGetAppText,
      getRichText: mockGetRichText,
    });

    expect(modal).toContain("rapportering-hva-vil-du-lagre");
  });
});

describe("getAktivitet", () => {
  it("viser aktivtet for arbeid med timer", () => {
    const aktivitet = getAktivitet({ type: "Arbeid", timer: "PT8H" }, mockGetAppText);
    expect(aktivitet).toContain("rapportering-arbeid (8)");
  });

  it("viser aktivtet for annen aktivitet", () => {
    const aktivitet = getAktivitet({ type: "Syk" }, mockGetAppText);
    expect(aktivitet).toContain("rapportering-syk");
  });
});

describe("getDag", () => {
  it("viser dag med aktivitet", () => {
    const dag = getDag(
      {
        dagIndex: 0,
        dato: "2024-06-13",
        aktiviteter: [{ type: "Arbeid", timer: "PT8H15M" }, { type: "Utdanning" }],
      },
      { kort: "man", lang: "mandag" },
      mockGetAppText
    );
    expect(dag).toBe("<li>mandag 13. rapportering-arbeid (8.25), rapportering-utdanning</li>");
  });

  it("viser dag uten aktivitet", () => {
    const dag = getDag(
      {
        dagIndex: 0,
        dato: "2024-06-13",
        aktiviteter: [],
      },
      { kort: "man", lang: "mandag" },
      mockGetAppText
    );
    expect(dag).toBe("<li>mandag 13. </li>");
  });
});

// describe("getKalender", () => {});

// describe("getOppsummering", () => {});

// describe("getInput", () => {});

// describe("samleHtmlForPeriode", () => {
//   const html = samleHtmlForPeriode(
//     innsendtRapporteringsperioderResponse,
//     innsendtRapporteringsperioderResponse[0],
//     mockGetAppText,
//     mockGetRichText,
//     locale
//   );
// });

// describe("htmlForLandingsside", () => {
//   const html = htmlForLandingsside({
//     rapporteringsperioder: innsendtRapporteringsperioderResponse,
//     periode: innsendtRapporteringsperioderResponse[0],
//     getAppText: mockGetAppText,
//     getRichText: mockGetRichText,
//     locale,
//   });

// });

import { TypedObject } from "@portabletext/types";
import { describe, expect, it, vi } from "vitest";

import { createSanityRichTextObject } from "~/hooks/useSanity";
import { AktivitetType } from "~/utils/aktivitettype.utils";
// import { aktivitetType } from "~/utils/aktivitettype.utils";
import { DecoratorLocale } from "~/utils/dekoratoren.utils";
import {
  getAktivitet,
  getAktivitetCheckbox,
  getAktivitetModal,
  getArbeidssokerAlert,
  getDag,
  getHeader,
  getInput,
  getKalender,
  getLesMer,
  getOppsummering,
  htmlForArbeidssoker,
  htmlForEndringBegrunnelse,
  htmlForFyllUt,
  htmlForLandingsside,
  htmlForOppsummering,
  htmlForRapporteringstype,
  htmlForTom,
  samleHtmlForPeriode,
} from "~/utils/journalforing.utils";
import { KortType, Rapporteringstype } from "~/utils/types";

import { innsendtRapporteringsperioderResponse } from "../../mocks/responses/innsendtRapporteringsperioderResponse";

vi.unmock("~/hooks/useSanity");
vi.unmock("@portabletext/react");

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
      mockGetRichText,
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
      tittel: "",
      innhold: "rapportering-les-mer-hva-skal-rapporteres-innhold",
    });

    expect(lesMer).toContain("rapportering-les-mer-hva-skal-rapporteres-innhold");
  });
});

describe("getAktivitetCheckbox", () => {
  const periode = innsendtRapporteringsperioderResponse[0];

  it("viser checkbox for arbeid", () => {
    const checkbox = getAktivitetCheckbox({
      rapporteringsperioder: [],
      periode,
      locale,
      getAppText: mockGetAppText,
      getRichText: mockGetRichText,
      aktivitet: AktivitetType.Arbeid,
    });
    expect(checkbox).toContain("<h4>rapportering-arbeid</h4>");
    expect(checkbox).toContain("<h5>rapportering-antall-timer</h5>");
    expect(checkbox).toContain("rapportering-aktivitet-jobb-prosentstilling-tittel");
  });

  it("viser checkbox for annen aktivitet", () => {
    const checkbox = getAktivitetCheckbox({
      rapporteringsperioder: [],
      periode,
      locale,
      getAppText: mockGetAppText,
      getRichText: mockGetRichText,
      aktivitet: AktivitetType.Utdanning,
    });
    expect(checkbox).toContain("<h4>rapportering-utdanning</h4>");
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
    const aktivitet = getAktivitet({ type: AktivitetType.Arbeid, timer: "PT8H" }, mockGetAppText);
    expect(aktivitet).toContain("rapportering-arbeid (8)");
  });

  it("viser aktivtet for annen aktivitet", () => {
    const aktivitet = getAktivitet({ type: AktivitetType.Syk }, mockGetAppText);
    expect(aktivitet).toContain("rapportering-syk");
  });
});

describe("getDag", () => {
  it("viser dag med aktivitet", () => {
    const dag = getDag(
      {
        dagIndex: 0,
        dato: "2024-06-13",
        aktiviteter: [
          { type: AktivitetType.Arbeid, timer: "PT8H15M" },
          { type: AktivitetType.Utdanning },
        ],
      },
      { kort: "man", lang: "mandag" },
      mockGetAppText,
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
      mockGetAppText,
    );
    expect(dag).toBe("<li>mandag 13. </li>");
  });
});

describe("getKalender", () => {
  it("viser liste med dager", () => {
    const kalender = getKalender(
      {
        rapporteringsperioder: innsendtRapporteringsperioderResponse,
        periode: innsendtRapporteringsperioderResponse[0],
        getAppText: mockGetAppText,
        getRichText: mockGetRichText,
        locale,
      },
      false,
    );

    expect(kalender).toContain("<ul>");
  });

  it("viser ikke modal", () => {
    const kalender = getKalender(
      {
        rapporteringsperioder: innsendtRapporteringsperioderResponse,
        periode: innsendtRapporteringsperioderResponse[0],
        getAppText: mockGetAppText,
        getRichText: mockGetRichText,
        locale,
      },
      false,
    );

    expect(kalender).not.toContain("rapportering-hva-vil-du-lagre");
  });

  it("viser modal", () => {
    const kalender = getKalender(
      {
        rapporteringsperioder: innsendtRapporteringsperioderResponse,
        periode: innsendtRapporteringsperioderResponse[0],
        getAppText: mockGetAppText,
        getRichText: mockGetRichText,
        locale,
      },
      true,
    );

    expect(kalender).toContain("rapportering-hva-vil-du-lagre");
  });
});

describe("getOppsummering", () => {
  it("viser oppsummering med arbeid", () => {
    const oppsummering = getOppsummering({
      getAppText: mockGetAppText,
      periode: innsendtRapporteringsperioderResponse[0],
    });

    expect(oppsummering).toContain("rapportering-arbeid: 23 rapportering-timer");
    expect(oppsummering).toContain("rapportering-syk: 3 rapportering-dager");
    expect(oppsummering).toContain("rapportering-fraevaer: 0 rapportering-dager");
  });
});

describe("getInput", () => {
  const checkboxProps = {
    type: "checkbox",
    checked: true,
    label: "test",
    name: "test",
  };

  it("viser avhuket checkbox", () => {
    const checkbox = getInput(checkboxProps);
    expect(checkbox).toContain("checked");
  });

  it("viser checkbox som ikke er avhuket", () => {
    const checkbox = getInput({ ...checkboxProps, checked: false });
    expect(checkbox).toContain('type="checkbox" name="test"  />');
  });

  it("viser radiobutton som er valgt", () => {
    const checkbox = getInput({ ...checkboxProps, type: "radio", checked: true });
    expect(checkbox).toContain('type="radio" name="test" checked />');
  });
});

describe("htmlForLandingsside", () => {
  it("viser checkbox hvis det er en periode å fylle ut", () => {
    const html = htmlForLandingsside({
      rapporteringsperioder: innsendtRapporteringsperioderResponse,
      periode: innsendtRapporteringsperioderResponse[0],
      getAppText: mockGetAppText,
      getRichText: mockGetRichText,
      locale,
    });

    expect(html).toContain(
      '<form><input type="checkbox" name="rapportering-samtykke-checkbox" checked/><label>rapportering-samtykke-checkbox</label></form>',
    );
  });

  it("viser alert hvis det ikke er noen rapporteringsperioder", () => {
    const html = htmlForLandingsside({
      rapporteringsperioder: [],
      periode: null,
      getAppText: mockGetAppText,
      getRichText: mockGetRichText,
      locale,
    });

    expect(html).toContain("rapportering-ingen-meldekort");
  });

  it("viser alert hvis det er for tidlig å sende inn rapporteringsperioden", () => {
    const html = htmlForLandingsside({
      rapporteringsperioder: innsendtRapporteringsperioderResponse,
      periode: {
        ...innsendtRapporteringsperioderResponse[0],
        kanSendes: false,
      },
      getAppText: mockGetAppText,
      getRichText: mockGetRichText,
      locale,
    });

    expect(html).toContain("rapportering-for-tidlig-a-sende-meldekort");
  });
});

describe("htmlForRapporteringstype", () => {
  it("viser alert hvis det er flere perioder som skal sendes inn", () => {
    const html = htmlForRapporteringstype({
      rapporteringsperioder: innsendtRapporteringsperioderResponse,
      periode: innsendtRapporteringsperioderResponse[0],
      getAppText: mockGetAppText,
      getRichText: mockGetRichText,
      locale,
    });

    expect(html).toContain("rapportering-flere-perioder-tittel");
  });

  it("viser ikke alert hvis det bare er én periode som skal sendes inn", () => {
    const html = htmlForRapporteringstype({
      rapporteringsperioder: [innsendtRapporteringsperioderResponse[0]],
      periode: innsendtRapporteringsperioderResponse[0],
      getAppText: mockGetAppText,
      getRichText: mockGetRichText,
      locale,
    });

    expect(html).not.toContain("rapportering-flere-perioder-tittel");
  });

  it("viser at harIngenAktivitet er valgt", () => {
    const html = htmlForRapporteringstype({
      rapporteringsperioder: innsendtRapporteringsperioderResponse,
      periode: {
        ...innsendtRapporteringsperioderResponse[0],
        rapporteringstype: Rapporteringstype.harIngenAktivitet,
      },
      getAppText: mockGetAppText,
      getRichText: mockGetRichText,
      locale,
    });

    expect(html).toContain("checked /><label>rapportering-ingen-å-rapportere");
  });

  it("viser at harAktivitet er valgt", () => {
    const html = htmlForRapporteringstype({
      rapporteringsperioder: innsendtRapporteringsperioderResponse,
      periode: {
        ...innsendtRapporteringsperioderResponse[0],
        rapporteringstype: Rapporteringstype.harAktivitet,
      },
      getAppText: mockGetAppText,
      getRichText: mockGetRichText,
      locale,
    });

    expect(html).toContain("checked /><label>rapportering-noe-å-rapportere");
  });
});

describe("htmlForArbeidssoker", () => {
  const html = htmlForArbeidssoker({
    rapporteringsperioder: innsendtRapporteringsperioderResponse,
    periode: innsendtRapporteringsperioderResponse[0],
    getAppText: mockGetAppText,
    getRichText: mockGetRichText,
    locale,
  });

  it("viser radio buttons", () => {
    expect(html).toContain('type="radio"');
  });

  it("viser at bruker skal forbli arbeidssøker", () => {
    expect(html).toContain("checked /><label>rapportering-arbeidssokerregister-svar-ja");
  });

  const html2 = htmlForArbeidssoker({
    rapporteringsperioder: innsendtRapporteringsperioderResponse,
    periode: { ...innsendtRapporteringsperioderResponse[0], registrertArbeidssoker: false },
    getAppText: mockGetAppText,
    getRichText: mockGetRichText,
    locale,
  });

  it("viser at bruker skal avregistreres som arbeidssøker", () => {
    expect(html2).toContain("checked /><label>rapportering-arbeidssokerregister-svar-nei");
  });
});

describe("htmlForOppsummering", () => {
  const begrunnelseEndring = "Annet";
  const endretMeldekort = htmlForOppsummering({
    rapporteringsperioder: innsendtRapporteringsperioderResponse,
    periode: {
      ...innsendtRapporteringsperioderResponse[0],
      originalId: "123",
      begrunnelseEndring,
    },
    getAppText: mockGetAppText,
    getRichText: mockGetRichText,
    locale,
  });

  it("viser alert for endret meldekort", () => {
    expect(endretMeldekort).toContain("rapportering-endring-ikke-sendt-enda");
  });

  it("viser oppsummering for endret meldekort", () => {
    expect(endretMeldekort).toContain("<h3>rapportering-endring-begrunnelse-tittel</h3>");
    expect(endretMeldekort).toContain(`<p>${begrunnelseEndring}</p>`);
  });

  it("viser checkbox for å godta endret meldekort", () => {
    expect(endretMeldekort).toContain("rapportering-endring-send-inn-bekreft-opplysning");
  });

  const nyttMeldekort = htmlForOppsummering({
    rapporteringsperioder: innsendtRapporteringsperioderResponse,
    periode: innsendtRapporteringsperioderResponse[0],
    getAppText: mockGetAppText,
    getRichText: mockGetRichText,
    locale,
  });

  it("viser alert for nytt meldekort", () => {
    expect(nyttMeldekort).toContain("rapportering-meldekort-ikke-sendt-enda");
  });

  it("viser oppsummering for nytt meldekort", () => {
    const alert = getArbeidssokerAlert(
      innsendtRapporteringsperioderResponse[0],
      mockGetAppText,
      mockGetRichText,
    );

    expect(nyttMeldekort).toContain(alert);
  });

  it("viser checkbox for å godta opplysninger", () => {
    expect(nyttMeldekort).toContain("rapportering-send-inn-bekreft-opplysning");
  });
});

describe("htmlForFyllUt", () => {
  it("viser fyll ut for endret meldekort", () => {
    const html = htmlForFyllUt({
      rapporteringsperioder: innsendtRapporteringsperioderResponse,
      periode: {
        ...innsendtRapporteringsperioderResponse[0],
        originalId: "123",
      },
      getAppText: mockGetAppText,
      getRichText: mockGetRichText,
      locale,
    });

    expect(html).toContain("rapportering-periode-endre-beskrivelse");
  });

  it("viser fyll ut for nytt meldekort", () => {
    const html = htmlForFyllUt({
      rapporteringsperioder: innsendtRapporteringsperioderResponse,
      periode: innsendtRapporteringsperioderResponse[0],
      getAppText: mockGetAppText,
      getRichText: mockGetRichText,
      locale,
    });

    expect(html).toContain("rapportering-periode-fyll-ut-tittel");
    expect(html).toContain("rapportering-periode-fyll-ut-beskrivelse");
  });
});

describe("htmlForTom", () => {
  it("viser siden tom med informasjon", () => {
    const html = htmlForTom({
      rapporteringsperioder: innsendtRapporteringsperioderResponse,
      periode: innsendtRapporteringsperioderResponse[0],
      getAppText: mockGetAppText,
      getRichText: mockGetRichText,
      locale,
    });

    expect(html).toContain("<h2>rapportering-tom-periode-tittel</h2>");
  });
});

describe("htmlForEndringBegrunnelse", () => {
  const html = htmlForEndringBegrunnelse({
    rapporteringsperioder: innsendtRapporteringsperioderResponse,
    periode: {
      ...innsendtRapporteringsperioderResponse[0],
      begrunnelseEndring: "rapportering-endring-begrunnelse-nedtrekksmeny-option-3",
    },
    getAppText: mockGetAppText,
    getRichText: mockGetRichText,
    locale,
  });

  it("viser liste over mulige begrunnelser", () => {
    expect(html).toContain("<li>rapportering-endring-begrunnelse-nedtrekksmeny-option-1</li>");
  });

  it("viser valgt begurnnelse som strong", () => {
    expect(html).toContain(
      "<li><strong>rapportering-endring-begrunnelse-nedtrekksmeny-option-3</strong></li>",
    );
  });
});

describe("samleHtmlForPeriode", () => {
  it("viser html for endret meldekort", () => {
    const props = {
      rapporteringsperioder: innsendtRapporteringsperioderResponse,
      periode: {
        ...innsendtRapporteringsperioderResponse[0],
        begrunnelseEndring: "rapportering-endring-begrunnelse-nedtrekksmeny-option-3",
        originalId: "123",
      },
      getAppText: mockGetAppText,
      getRichText: mockGetRichText,
      locale,
    };

    const endringBegurnnelse = htmlForEndringBegrunnelse(props);
    const html = samleHtmlForPeriode(
      props.rapporteringsperioder,
      props.periode,
      mockGetAppText,
      mockGetRichText,
      locale,
    );

    expect(html).toContain(endringBegurnnelse);
  });

  const props = {
    rapporteringsperioder: innsendtRapporteringsperioderResponse,
    periode: {
      ...innsendtRapporteringsperioderResponse[0],
      dager: innsendtRapporteringsperioderResponse[0].dager.map((dag) => ({
        ...dag,
        aktiviteter: [],
      })),

      Rapporteringstype: Rapporteringstype.harAktivitet,
    },
    getAppText: mockGetAppText,
    getRichText: mockGetRichText,
    locale,
  };

  const html = samleHtmlForPeriode(
    props.rapporteringsperioder,
    props.periode,
    mockGetAppText,
    mockGetRichText,
    locale,
  );

  it("viser html for nytt meldekort", () => {
    const landingsside = htmlForLandingsside(props);
    expect(html).toContain(landingsside);
  });

  it("viser fyll ut hvis brukeren har registrert at hen harAktivitet", () => {
    const fyllUt = htmlForFyllUt(props);

    expect(html).toContain(fyllUt);
  });

  it("viser tom hvis brukeren har registrert at hen harAktivitet, men ikke registrert noen", () => {
    const tom = htmlForTom(props);

    expect(html).toContain(tom);
  });
});

describe("Etterregistrert meldekort", () => {
  it("viser ikke arbeidssokerstatus", () => {
    const props = {
      rapporteringsperioder: [],
      periode: {
        ...innsendtRapporteringsperioderResponse[0],
        type: KortType.MANUELL_ARENA,
        registrertArbeidssoker: null,
      },
      getAppText: mockGetAppText,
      getRichText: mockGetRichText,
      locale,
    };

    const html = samleHtmlForPeriode(
      props.rapporteringsperioder,
      props.periode,
      mockGetAppText,
      mockGetRichText,
      locale,
    );

    expect(html).not.toContain("rapportering-arbeidssokerregister-svar-ja");
    expect(html).not.toContain("rapportering-arbeidssokerregister-alert-tittel");
  });
});

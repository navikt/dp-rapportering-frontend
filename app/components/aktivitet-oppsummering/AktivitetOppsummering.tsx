import { Heading } from "@navikt/ds-react";
import { Fragment } from "react";
import { useRouteLoaderData } from "react-router";

import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import type { loader as RootLoader } from "~/root";
import type { MeldekortBrukerflateApiResponse } from "~/sanity/queries/meldekort-brukerflate";
import { AktivitetType } from "~/utils/aktivitettype.utils";
import { hentTotaltArbeidstimer, hentTotaltDagerMedAktivitetstype } from "~/utils/periode.utils";
import { sanityTekst } from "~/utils/sanity.utils";

import styles from "./AktivitetOppsummering.module.css";

interface IProps {
  periode: IRapporteringsperiode;
}

type MeldekortdetaljerTekster = Pick<
  NonNullable<MeldekortBrukerflateApiResponse["meldekortdetaljer"]>,
  "oppsummering" | "aktiviteter" | "tidsverdi"
>;

const tidsverdiFelter = {
  timer: {
    singular: "timerSingular",
    plural: "timerPlural",
  },
  dager: {
    singular: "dagerSingular",
    plural: "dagerPlural",
  },
} as const satisfies Record<
  "timer" | "dager",
  Record<"singular" | "plural", keyof NonNullable<MeldekortdetaljerTekster["tidsverdi"]>>
>;

export interface AktivitetOppsummeringTekst {
  tittel: string;
  rader: { label: string; verdi: string }[];
}

export function hentAktivitetOppsummeringTekst(
  periode: IRapporteringsperiode,
  meldekortdetaljer: MeldekortdetaljerTekster | undefined,
): AktivitetOppsummeringTekst {
  const antallTimer = hentTotaltArbeidstimer(periode).toString().replace(".", ",");
  const aktiviteter = [
    { type: AktivitetType.Arbeid, feltnavn: "jobb" },
    { type: AktivitetType.Syk, feltnavn: "syk" },
    { type: AktivitetType.Fravaer, feltnavn: "ferie" },
    { type: AktivitetType.Utdanning, feltnavn: "utdanning" },
  ] as const;

  return {
    tittel: sanityTekst(meldekortdetaljer?.oppsummering, "meldekortdetaljer.oppsummering"),
    rader: aktiviteter.map(({ type, feltnavn }) => {
      const antall =
        type === AktivitetType.Arbeid
          ? antallTimer
          : hentTotaltDagerMedAktivitetstype(periode, type).toString();
      const enhet = type === AktivitetType.Arbeid ? "timer" : "dager";
      const antallsform = antall === "1" ? "singular" : "plural";
      const enhetsfelt = tidsverdiFelter[enhet][antallsform];

      return {
        label: sanityTekst(
          meldekortdetaljer?.aktiviteter?.[feltnavn]?.lang,
          `meldekortdetaljer.aktiviteter.${feltnavn}.lang`,
        ),
        verdi: `${antall} ${sanityTekst(
          meldekortdetaljer?.tidsverdi?.[enhetsfelt],
          `meldekortdetaljer.tidsverdi.${enhetsfelt}`,
        )}`,
      };
    }),
  };
}

export function AktivitetOppsummering({ periode }: IProps) {
  const rootData = useRouteLoaderData<typeof RootLoader>("root");
  const oppsummering = hentAktivitetOppsummeringTekst(
    periode,
    rootData?.sanityTekst?.meldekortdetaljer ?? undefined,
  );

  return (
    <div className={styles.aktivitetOppsummeringKontainer}>
      <Heading size="xsmall" level="4">
        {oppsummering.tittel}
      </Heading>
      <dl className={styles.aktivitetOppsummeringListe}>
        {oppsummering.rader.map((rad) => (
          <Fragment key={rad.label}>
            <dt>{rad.label}</dt>
            <dd>{rad.verdi}</dd>
          </Fragment>
        ))}
      </dl>
    </div>
  );
}

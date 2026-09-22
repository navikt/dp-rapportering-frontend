import { BodyShort, Heading } from "@navikt/ds-react";
import { useRouteLoaderData } from "react-router";

import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { ArbeidssokerstatusBeskjed } from "~/components/arbeidssokerstatus/ArbeidssokerstatusBeskjed";
import { Kalender } from "~/components/kalender/Kalender";
import { useLocale } from "~/hooks/useLocale";
import { useSanity } from "~/hooks/useSanity";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import type { loader as RootLoader } from "~/root";
import { formaterDato } from "~/utils/dato.utils";
import { nestePeriode } from "~/utils/periode.utils";
import { sanityTekst } from "~/utils/sanity.utils";

import rootStyles from "../../styles/root.module.css";
import styles from "./meldekortDetaljer.module.css";

interface ReviewDetaljerProps {
  periode: IRapporteringsperiode;
  visArbeidssokerSvar?: boolean;
}

export function MeltekortDetaljer({ periode, visArbeidssokerSvar = false }: ReviewDetaljerProps) {
  const { locale } = useLocale();
  const rootData = useRouteLoaderData<typeof RootLoader>("root");
  const { getAppText } = useSanity();

  const arbeidssokerStatusSvarTekst =
    periode.registrertArbeidssoker === null
      ? "—"
      : periode.registrertArbeidssoker
        ? sanityTekst(
            rootData?.sanityTekst?.utfylling?.arbeidssokerstatusSporsmaal?.alternativer?.ja,
            "utfylling.arbeidssokerstatusSporsmaal.alternativer.ja",
          )
        : sanityTekst(
            rootData?.sanityTekst?.utfylling?.arbeidssokerstatusSporsmaal?.alternativer?.nei,
            "utfylling.arbeidssokerstatusSporsmaal.alternativer.nei",
          );

  const nesteMeldeperiode = nestePeriode(periode.periode);
  const dateFormat =
    nesteMeldeperiode.fraOgMed.getFullYear() !== nesteMeldeperiode.tilOgMed.getFullYear() ||
    nesteMeldeperiode.fraOgMed.getFullYear() !== new Date().getFullYear()
      ? "d. MMMM yyyy"
      : "d. MMMM";
  const arbeidssokerSporsmal = (
    rootData?.sanityTekst?.utfylling?.arbeidssokerstatusSporsmaal?.tittel ??
    getAppText("utfylling.arbeidssokerstatusSporsmaal.tittel")
  )
    .replaceAll("{{fom}}", formaterDato({ dato: nesteMeldeperiode.fraOgMed, dateFormat }))
    .replaceAll(
      "{{tom}}",
      formaterDato({ dato: nesteMeldeperiode.tilOgMed, dateFormat: "d. MMMM yyyy" }),
    );

  const visArbeidssokerStatus = visArbeidssokerSvar && !!arbeidssokerStatusSvarTekst;
  const begrunnelse = periode.begrunnelseEndring;

  return (
    <div className={styles.meldekortWrapper}>
      <div className={rootStyles.textWrapper}>
        <Kalender periode={periode} readonly={true} locale={locale} aapneModal={() => {}} />
        <AktivitetOppsummering periode={periode} />
      </div>

      {visArbeidssokerStatus && (
        <>
          <div className={rootStyles.textWrapper}>
            <Heading size="xsmall" level="3">
              {arbeidssokerSporsmal}
            </Heading>
            <BodyShort>Du svarte: {arbeidssokerStatusSvarTekst}</BodyShort>
          </div>

          <ArbeidssokerstatusBeskjed periode={periode} side="bekreftelse" />
        </>
      )}

      {begrunnelse && (
        <div className={rootStyles.textWrapper}>
          <Heading size="xsmall" level="3">
            Begrunnelse
          </Heading>
          <BodyShort>{begrunnelse}</BodyShort>
        </div>
      )}
    </div>
  );
}

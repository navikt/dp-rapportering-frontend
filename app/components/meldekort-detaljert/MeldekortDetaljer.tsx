import { BodyShort, Heading } from "@navikt/ds-react";
import { useRouteLoaderData } from "react-router";

import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { ArbeidssokerstatusBeskjed } from "~/components/arbeidssokerstatus/ArbeidssokerstatusBeskjed";
import { Kalender } from "~/components/kalender/Kalender";
import { useLocale } from "~/hooks/useLocale";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import type { loader as RootLoader } from "~/root";
import { formaterDato } from "~/utils/dato.utils";
import { nestePeriode } from "~/utils/periode.utils";
import { sanityTekst } from "~/utils/sanity.utils";

import rootStyles from "../../styles/root.module.css";
import styles from "./meldekortDetaljer.module.css";

interface ReviewDetaljerProps {
  periode: IRapporteringsperiode;
  inkluderArbeidssokerstatusSvar?: boolean;
}

export function MeldekortDetaljer({
  periode,
  inkluderArbeidssokerstatusSvar = false,
}: ReviewDetaljerProps) {
  const { locale } = useLocale();
  const rootData = useRouteLoaderData<typeof RootLoader>("root");
  const utfylling = rootData?.sanityTekst?.utfylling;
  const arbeidssokerstatusSporsmaal = utfylling?.arbeidssokerstatusSporsmaal;

  const arbeidssokerStatusSvarTekst =
    periode.registrertArbeidssoker === null
      ? "—"
      : sanityTekst(
          periode.registrertArbeidssoker
            ? arbeidssokerstatusSporsmaal?.alternativer?.ja
            : arbeidssokerstatusSporsmaal?.alternativer?.nei,
          `utfylling.arbeidssokerstatusSporsmaal.alternativer.${periode.registrertArbeidssoker ? "ja" : "nei"}`,
        );

  const nesteMeldeperiode = nestePeriode(periode.periode);
  const dateFormat =
    nesteMeldeperiode.fraOgMed.getFullYear() !== nesteMeldeperiode.tilOgMed.getFullYear() ||
    nesteMeldeperiode.fraOgMed.getFullYear() !== new Date().getFullYear()
      ? "d. MMMM yyyy"
      : "d. MMMM";
  const arbeidssokerSporsmal = sanityTekst(
    arbeidssokerstatusSporsmaal?.tittel,
    "utfylling.arbeidssokerstatusSporsmaal.tittel",
  )
    .replaceAll("{{fom}}", formaterDato({ dato: nesteMeldeperiode.fraOgMed, dateFormat }))
    .replaceAll(
      "{{tom}}",
      formaterDato({ dato: nesteMeldeperiode.tilOgMed, dateFormat: "d. MMMM yyyy" }),
    );

  const skalViseArbeidssokerstatusSvar =
    inkluderArbeidssokerstatusSvar &&
    !rootData?.disableSpm5 &&
    periode.registrertArbeidssoker !== null;
  const begrunnelse = periode.begrunnelseEndring;
  const svarPrefiks = sanityTekst(
    arbeidssokerstatusSporsmaal?.svarPrefiks,
    "utfylling.arbeidssokerstatusSporsmaal.svarPrefiks",
  );
  const begrunnelseTittel = sanityTekst(
    utfylling?.begrunnelseForEndring?.tittel,
    "utfylling.begrunnelseForEndring.tittel",
  );

  return (
    <div className={styles.meldekortWrapper}>
      <div className={rootStyles.textWrapper}>
        <Kalender periode={periode} readonly={true} locale={locale} aapneModal={() => {}} />
        <AktivitetOppsummering periode={periode} />
      </div>

      {skalViseArbeidssokerstatusSvar && (
        <>
          <div className={rootStyles.textWrapper}>
            <Heading size="xsmall" level="3">
              {arbeidssokerSporsmal}
            </Heading>
            <BodyShort>
              {svarPrefiks} {arbeidssokerStatusSvarTekst}
            </BodyShort>
          </div>

          <ArbeidssokerstatusBeskjed periode={periode} side="bekreftelse" />
        </>
      )}

      {begrunnelse && (
        <div className={rootStyles.textWrapper}>
          <Heading size="xsmall" level="3">
            {begrunnelseTittel}
          </Heading>
          <BodyShort>{begrunnelse}</BodyShort>
        </div>
      )}
    </div>
  );
}

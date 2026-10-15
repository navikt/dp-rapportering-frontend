import { BodyShort, Heading } from "@navikt/ds-react";
import { useRouteLoaderData } from "react-router";

import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { ArbeidssokerstatusSvar } from "~/components/arbeidssokerstatus/ArbeidssokerstatusSvar";
import { Kalender } from "~/components/kalender/Kalender";
import { useLocale } from "~/hooks/useLocale";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import type { loader as RootLoader } from "~/root";
import { erKorrigertMeldekort } from "~/utils/arbeidssokerstatus.utils";
import { normaliserArbeidssokerSvar } from "~/utils/periode.utils";
import { sanityTekst } from "~/utils/sanity.utils";

import rootStyles from "../../styles/root.module.css";
import styles from "./meldekortDetaljer.module.css";

interface ReviewDetaljerProps {
  periode: IRapporteringsperiode;
  inkluderArbeidssokerstatusSvar?: boolean;
  visArbeidssokerstatusBeskjed?: boolean;
}

export function MeldekortDetaljer({
  periode,
  inkluderArbeidssokerstatusSvar = false,
  visArbeidssokerstatusBeskjed = false,
}: ReviewDetaljerProps) {
  const { locale } = useLocale();
  const rootData = useRouteLoaderData<typeof RootLoader>("root");
  const utfylling = rootData?.sanityTekst?.utfylling;
  const skalViseArbeidssokerstatusSvar =
    inkluderArbeidssokerstatusSvar &&
    !erKorrigertMeldekort(periode) &&
    (rootData?.nyArbeidssokerstatusFlytAktiv || normaliserArbeidssokerSvar(periode) !== null);
  const begrunnelse = periode.begrunnelseEndring;
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
        <ArbeidssokerstatusSvar
          periode={periode}
          visBeskjed={visArbeidssokerstatusBeskjed && !periode.originalId}
        />
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

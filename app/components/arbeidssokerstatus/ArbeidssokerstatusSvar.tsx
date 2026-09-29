import { BodyShort, Heading } from "@navikt/ds-react";
import { useRouteLoaderData } from "react-router";

import { ArbeidssokerstatusBeskjed } from "~/components/arbeidssokerstatus/ArbeidssokerstatusBeskjed";
import { useLocale } from "~/hooks/useLocale";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import type { loader as RootLoader } from "~/root";
import { formaterDato } from "~/utils/dato.utils";
import { nestePeriode, normaliserArbeidssokerSvar } from "~/utils/periode.utils";
import { sanityTekst } from "~/utils/sanity.utils";

import rootStyles from "../../styles/root.module.css";

interface Props {
  periode: IRapporteringsperiode;
  visBeskjed?: boolean;
}

export function ArbeidssokerstatusSvar({ periode, visBeskjed = false }: Props) {
  const { locale } = useLocale();
  const rootData = useRouteLoaderData<typeof RootLoader>("root");
  const arbeidssokerstatusSporsmaal = rootData?.sanityTekst?.utfylling?.arbeidssokerstatusSporsmaal;
  const svar = normaliserArbeidssokerSvar(periode);
  const nesteMeldeperiode = nestePeriode(periode.periode);
  const dateFormat =
    nesteMeldeperiode.fraOgMed.getFullYear() !== nesteMeldeperiode.tilOgMed.getFullYear() ||
    nesteMeldeperiode.fraOgMed.getFullYear() !== new Date().getFullYear()
      ? "d. MMMM yyyy"
      : "d. MMMM";
  const sporsmaal = sanityTekst(
    arbeidssokerstatusSporsmaal?.tittel,
    "utfylling.arbeidssokerstatusSporsmaal.tittel",
  )
    .replaceAll("{{fom}}", formaterDato({ dato: nesteMeldeperiode.fraOgMed, dateFormat, locale }))
    .replaceAll(
      "{{tom}}",
      formaterDato({ dato: nesteMeldeperiode.tilOgMed, dateFormat: "d. MMMM yyyy", locale }),
    );
  const svarTekst =
    svar === null
      ? "—"
      : sanityTekst(
          svar
            ? arbeidssokerstatusSporsmaal?.alternativer?.ja
            : arbeidssokerstatusSporsmaal?.alternativer?.nei,
          `utfylling.arbeidssokerstatusSporsmaal.alternativer.${svar ? "ja" : "nei"}`,
        );
  const svarPrefiks = sanityTekst(
    arbeidssokerstatusSporsmaal?.svarPrefiks,
    "utfylling.arbeidssokerstatusSporsmaal.svarPrefiks",
  );

  return (
    <div className={rootStyles.textWrapper}>
      <div className={rootStyles.spmWrapper}>
        <Heading size="xsmall" level="3">
          {sporsmaal}
        </Heading>
        <BodyShort>
          {svarPrefiks} {svarTekst}
        </BodyShort>
      </div>
      {visBeskjed && <ArbeidssokerstatusBeskjed periode={periode} side="bekreftelse" />}
    </div>
  );
}

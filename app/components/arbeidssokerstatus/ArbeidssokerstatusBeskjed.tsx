import { ExclamationmarkTriangleIcon, InformationSquareIcon } from "@navikt/aksel-icons";
import { InfoCard } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { useRouteLoaderData } from "react-router";

import { useLocale } from "~/hooks/useLocale";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import type { loader as RootLoader } from "~/root";
import type { MeldekortBrukerflateApiResponse } from "~/sanity/queries/meldekort-brukerflate";
import { formaterDato } from "~/utils/dato.utils";
import { nestePeriode, skalHaArbeidssokerSporsmal } from "~/utils/periode.utils";
import { KortType, OPPRETTET_AV } from "~/utils/types";

export type ArbeidssokerstatusSide = "utfylling" | "bekreftelse" | "oversikt";

interface IProps {
  periode: IRapporteringsperiode;
  side: ArbeidssokerstatusSide;
}

// Delt med journalforing.utils.tsx for å sikre at arkivert HTML gjenspeiler det brukeren faktisk ser
export function hentArbeidssokerstatusInnhold(
  periode: IRapporteringsperiode,
  side: ArbeidssokerstatusSide,
  beskjeder: MeldekortBrukerflateApiResponse["arbeidssokerstatusBeskjeder"] | undefined,
): { tekst: PortableTextBlock[] | null | undefined; variant: "info" | "warning" } {
  let tekst: PortableTextBlock[] | null | undefined;
  let variant: "info" | "warning" = "info";

  if (side === "oversikt") {
    if (periode.innsendtTil === OPPRETTET_AV.Arena) {
      tekst = beskjeder?.fraArena;
    } else if (periode.type === KortType.ETTERREGISTRERT) {
      tekst = beskjeder?.etterregistrert;
    } else if (!skalHaArbeidssokerSporsmal(periode)) {
      tekst = beskjeder?.utenArbeidssokerSporsmaal;
    }
  } else if (!skalHaArbeidssokerSporsmal(periode)) {
    tekst = beskjeder?.duSkalIkkeSvarePaSporsmaal;
  } else if (periode.registrertArbeidssoker === true) {
    tekst = beskjeder?.duVilVaereRegistrert;
  } else if (periode.registrertArbeidssoker === false) {
    variant = "warning";
    tekst =
      side === "utfylling"
        ? beskjeder?.duVilBliAvregistrert.lang
        : beskjeder?.duVilBliAvregistrert.kort;
  }

  return { tekst, variant };
}

export function ArbeidssokerstatusBeskjed({ periode, side }: IProps) {
  const { locale } = useLocale();
  const rootData = useRouteLoaderData<typeof RootLoader>("root");
  const beskjeder = rootData?.sanityTekst?.arbeidssokerstatusBeskjeder;
  const { tekst, variant } = hentArbeidssokerstatusInnhold(periode, side, beskjeder);

  if (!tekst) return null;

  const dato = formaterDato({
    dato: nestePeriode(periode.periode).fraOgMed,
    dateFormat: "d. MMMM yyyy",
    locale,
  });
  const tekstMedDato = tekst.map((block) => ({
    ...block,
    children: block.children.map((child) => ({
      ...child,
      text: child.text?.replaceAll("{{nestePeriodeDato}}", dato),
    })),
  }));

  const variantIcon =
    variant === "warning" ? (
      <ExclamationmarkTriangleIcon aria-hidden />
    ) : (
      <InformationSquareIcon aria-hidden />
    );

  return (
    <InfoCard data-color={variant} className="my-6 alert-with-rich-text">
      <InfoCard.Message icon={variantIcon}>
        <PortableText value={tekstMedDato} />
      </InfoCard.Message>
    </InfoCard>
  );
}

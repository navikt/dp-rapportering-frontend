import { ExclamationmarkTriangleIcon, InformationSquareIcon } from "@navikt/aksel-icons";
import { InfoCard } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { useRouteLoaderData } from "react-router";

import { useLocale } from "~/hooks/useLocale";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import type { loader as RootLoader } from "~/root";
import { formaterDato } from "~/utils/dato.utils";
import { nestePeriode, skalHaArbeidssokerSporsmal } from "~/utils/periode.utils";
import { KortType, OPPRETTET_AV } from "~/utils/types";

interface IProps {
  periode: IRapporteringsperiode;
  side: "utfylling" | "bekreftelse" | "oversikt";
}

export function ArbeidssokerstatusBeskjed({ periode, side }: IProps) {
  const { locale } = useLocale();
  const rootData = useRouteLoaderData<typeof RootLoader>("root");
  const beskjeder = rootData?.sanityTekst?.arbeidssokerstatusBeskjeder;
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

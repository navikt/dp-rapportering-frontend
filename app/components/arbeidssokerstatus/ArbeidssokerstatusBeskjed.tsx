import { ExclamationmarkTriangleIcon, InformationSquareIcon } from "@navikt/aksel-icons";
import { InfoCard } from "@navikt/ds-react";
import type { PortableTextBlock } from "@portabletext/types";
import { useRouteLoaderData } from "react-router";

import { useLocale } from "~/hooks/useLocale";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import type { loader as RootLoader } from "~/root";
import type { MeldekortBrukerflateApiResponse } from "~/sanity/queries/meldekort-brukerflate";
import { formaterDato } from "~/utils/dato.utils";
import {
  hentArbeidssokerstatusAarsakskategori,
  nestePeriode,
  normaliserArbeidssokerSvar,
} from "~/utils/periode.utils";
import { sanityRichText } from "~/utils/sanity.utils";

import { PortableTextRenderer } from "../portable-text/PortableTextRenderer";

export type ArbeidssokerstatusSide = "utfylling" | "bekreftelse";

interface IProps {
  periode: IRapporteringsperiode;
  side: ArbeidssokerstatusSide;
}

// Delt med journalforing.utils.tsx for å sikre at arkivert HTML gjenspeiler det brukeren faktisk ser
export function hentArbeidssokerstatusInnhold(
  periode: IRapporteringsperiode,
  side: ArbeidssokerstatusSide,
  beskjeder: MeldekortBrukerflateApiResponse["arbeidssokerstatusBeskjeder"] | undefined,
  skalAktivereSpm5Feature = false,
): {
  tekst: PortableTextBlock[] | null | undefined;
  variant: "info" | "warning";
  felt: string | undefined;
} {
  const { viHarIkkeAnsvar, periodenHarVaert } = hentArbeidssokerstatusAarsakskategori(periode);
  const arbeidssokerSvar = normaliserArbeidssokerSvar(periode);
  const utenBeskjed = {
    tekst: undefined,
    variant: "info" as const,
    felt: undefined,
  };

  if (skalAktivereSpm5Feature && viHarIkkeAnsvar) {
    return {
      ...utenBeskjed,
      tekst: beskjeder?.viHarIkkeAnsvar,
      felt: "arbeidssokerstatusBeskjeder.viHarIkkeAnsvar",
    };
  }

  if (skalAktivereSpm5Feature && periodenHarVaert) {
    return {
      ...utenBeskjed,
      tekst: beskjeder?.periodenErGammel,
      felt: "arbeidssokerstatusBeskjeder.periodenErGammel",
    };
  }

  if (arbeidssokerSvar === null) return utenBeskjed;

  if (arbeidssokerSvar) {
    return {
      ...utenBeskjed,
      tekst: beskjeder?.duVilVaereRegistrert,
      felt: "arbeidssokerstatusBeskjeder.duVilVaereRegistrert",
    };
  }

  return {
    ...utenBeskjed,
    tekst:
      side === "utfylling"
        ? beskjeder?.duVilBliAvregistrert.lang
        : beskjeder?.duVilBliAvregistrert.kort,
    variant: "warning",
    felt:
      side === "utfylling"
        ? "arbeidssokerstatusBeskjeder.duVilBliAvregistrert.lang"
        : "arbeidssokerstatusBeskjeder.duVilBliAvregistrert.kort",
  };
}

export function ArbeidssokerstatusBeskjed({ periode, side }: IProps) {
  const { locale } = useLocale();
  const rootData = useRouteLoaderData<typeof RootLoader>("root");
  const beskjeder = rootData?.sanityTekst?.arbeidssokerstatusBeskjeder;
  const { tekst, variant, felt } = hentArbeidssokerstatusInnhold(
    periode,
    side,
    beskjeder,
    rootData?.disableSpm5,
  );

  if (!felt) return null;

  const dato = formaterDato({
    dato: nestePeriode(periode.periode).fraOgMed,
    dateFormat: "d. MMMM yyyy",
    locale,
  });
  const tekstMedDato = sanityRichText(tekst, felt).map((block) => ({
    ...block,
    children: block.children.map((child) => ({
      ...child,
      text: child.text?.replaceAll("{{nestePeriodeDato}}", dato),
    })),
  }));

  if (tekstMedDato.length === 0) return null;

  const variantIcon =
    variant === "warning" ? (
      <ExclamationmarkTriangleIcon aria-hidden />
    ) : (
      <InformationSquareIcon aria-hidden />
    );

  return (
    <InfoCard data-color={variant}>
      <InfoCard.Message icon={variantIcon}>
        <PortableTextRenderer value={tekstMedDato} />
      </InfoCard.Message>
    </InfoCard>
  );
}

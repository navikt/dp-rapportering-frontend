import { ArrowRightIcon } from "@navikt/aksel-icons";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { Rapporteringstype } from "~/utils/types";
import { useSanity } from "~/hooks/useSanity";
import { RemixLink } from "~/components/RemixLink";
import Center from "~/components/center/Center";

interface NesteKnappProps {
  rapporteringstype: Rapporteringstype | undefined;
  rapporteringsPeriode: IRapporteringsperiode;
}

export function NesteKnapp({ rapporteringstype, rapporteringsPeriode }: NesteKnappProps) {
  const { getAppText, getLink } = useSanity();

  if (!rapporteringstype) return null;

  const link =
    rapporteringstype === Rapporteringstype.harAktivitet
      ? `/periode/${rapporteringsPeriode.id}/fyll-ut`
      : `/periode/${rapporteringsPeriode.id}/send-inn`;

  const label =
    rapporteringstype === Rapporteringstype.harAktivitet
      ? getLink("rapportering-rapporter-for-perioden").linkText
      : getAppText("rapportering-knapp-neste");

  return (
    <Center>
      <RemixLink
        size="medium"
        as="Button"
        to={link}
        className="my-18 py-4 px-16"
        icon={<ArrowRightIcon aria-hidden />}
        iconPosition="right"
        disabled={!rapporteringstype}
      >
        {label}
      </RemixLink>
    </Center>
  );
}

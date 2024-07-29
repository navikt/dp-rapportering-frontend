import { ArrowRightIcon } from "@navikt/aksel-icons";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { Rapporteringstype } from "~/hooks/useRapporteringstype";
import { useSanity } from "~/hooks/useSanity";
import { RemixLink } from "~/components/RemixLink";
import Center from "~/components/center/Center";

export function NextButton({
  rappporteringstype,
  rapporteringsPeriode,
}: {
  rappporteringstype: Rapporteringstype | undefined;
  rapporteringsPeriode: IRapporteringsperiode;
}) {
  const { getAppText, getLink } = useSanity();

  if (!rappporteringstype) return null;

  return (
    <Center>
      <RemixLink
        size="medium"
        as="Button"
        to={
          rappporteringstype === Rapporteringstype.harAktivitet
            ? `/periode/${rapporteringsPeriode.id}/fyll-ut`
            : `/periode/${rapporteringsPeriode.id}/send-inn`
        }
        className="my-18 py-4 px-16"
        icon={<ArrowRightIcon aria-hidden />}
        iconPosition="right"
        disabled={!rappporteringstype}
      >
        {rappporteringstype === Rapporteringstype.harAktivitet
          ? getLink("rapportering-rapporter-for-perioden").linkText
          : getAppText("rapportering-knapp-neste")}
      </RemixLink>
    </Center>
  );
}

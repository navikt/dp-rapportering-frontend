import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Heading, Select } from "@navikt/ds-react";
import { useFetcher } from "@remix-run/react";
import { ChangeEvent } from "react";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { LagretAutomatisk } from "~/components/LagretAutomatisk";
import { RemixLink } from "~/components/RemixLink";

export default function RapporteringsPeriodeFyllUtSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const fetcher = useFetcher();
  const { getAppText, getLink } = useSanity();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;

    fetcher.submit(
      {
        rapporteringsperiodeId: periode.id,
        begrunnelseEndring: value,
      },
      { method: "post", action: "/api/begrunnelse" }
    );
  };

  return (
    <>
      <Heading tabIndex={-1} size={"large"} level={"2"} className="vo-fokus">
        {getAppText("rapportering-periode-endre-tittel")}
      </Heading>

      <Select
        label={getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-label")}
        description={getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-description")}
        name="begrunnelseEndring"
        value={periode.begrunnelseEndring}
        onChange={handleChange}
      >
        <option value="">
          {getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-select")}
        </option>
        <option value={getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-option-1")}>
          {getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-option-1")}
        </option>
        <option value={getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-option-2")}>
          {getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-option-2")}
        </option>
        <option value={getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-option-3")}>
          {getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-option-3")}
        </option>
        <option value={getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-option-4")}>
          {getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-option-4")}
        </option>
        <option value={getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-option-5")}>
          {getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-option-5")}
        </option>
        <option value={getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-option-6")}>
          {getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-option-6")}
        </option>
        <option value={getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-option-other")}>
          {getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-option-other")}
        </option>
      </Select>

      <div className="navigasjon-container-to-knapper my-4">
        <RemixLink
          as="Button"
          to={`/periode/${periode.id}/endring/fyll-ut`}
          variant="secondary"
          className="py-4 px-8"
          iconPosition="left"
          icon={<ArrowLeftIcon aria-hidden />}
        >
          {getLink("rapportering-knapp-tilbake").linkText}
        </RemixLink>

        <RemixLink
          as="Button"
          to={`/periode/${periode.id}/endring/send-inn`}
          variant="primary"
          icon={<ArrowRightIcon aria-hidden />}
          iconPosition="right"
          className="py-4 px-8"
          disabled={!periode.begrunnelseEndring}
        >
          {getAppText("rapportering-knapp-neste")}
        </RemixLink>
      </div>
      <div className="navigasjon-container-en-knapp my-4">
        <RemixLink
          as="Link"
          to={getLink("rapportering-endre-avbryt").linkUrl}
          variant="primary"
          className="py-4 px-8"
        >
          {getLink("rapportering-endre-avbryt").linkText}
        </RemixLink>
      </div>

      <LagretAutomatisk />
    </>
  );
}

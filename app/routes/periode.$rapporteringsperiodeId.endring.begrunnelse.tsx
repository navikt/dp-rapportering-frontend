import { ArrowRightIcon } from "@navikt/aksel-icons";
import { BodyLong, Heading, Select } from "@navikt/ds-react";
import type { ActionFunctionArgs } from "@remix-run/node";
// import { useActionData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { slettAlleAktiviteter, validerOgLagreAktivitet } from "~/utils/aktivitet.action.server";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { LagretAutomatisk } from "~/components/LagretAutomatisk";
import { RemixLink } from "~/components/RemixLink";

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const periodeId = params.rapporteringsperiodeId;
  const formdata = await request.formData();
  const submitKnapp = formdata.get("submit");

  switch (submitKnapp) {
    case "slette": {
      return await slettAlleAktiviteter(request, periodeId, formdata);
    }

    case "lagre": {
      return await validerOgLagreAktivitet(request, periodeId, formdata);
    }

    default: {
      return {
        status: "error",
        error: {
          statusCode: 500,
          statusText: "Det skjedde en feil.",
        },
      };
    }
  }
}

export default function RapporteringsPeriodeFyllUtSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");

  const { getAppText, getLink } = useSanity();
  // const actionData = useActionData<typeof action>();

  return (
    <>
      <div className="rapportering-container">
        <Heading tabIndex={-1} size={"large"} level={"2"} className="vo-fokus">
          {getAppText("rapportering-periode-endre-tittel")}
        </Heading>

        <Heading size="medium" level="3" className="my-4">
          {getAppText("rapportering-endring-begrunnelse-tittel")}
        </Heading>

        <BodyLong className="mb-4">
          {getAppText("rapportering-endring-begrunnelse-beskrivelse")}
        </BodyLong>

        <Select
          label={getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-label")}
          description={getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-description")}
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
            to={`${getLink("rapportering-endring-fyll-ut-avbryt").linkUrl}`}
            variant="secondary"
            className="py-4 px-8"
            disabled
          >
            {getLink("rapportering-endring-fyll-ut-avbryt").linkText}
          </RemixLink>

          <RemixLink
            as="Button"
            to={`/periode/${periode.id}/endring/send-inn`}
            variant="primary"
            icon={<ArrowRightIcon aria-hidden />}
            iconPosition="right"
            className="py-4 px-8"
          >
            {getAppText("rapportering-knapp-neste")}
          </RemixLink>
        </div>

        <LagretAutomatisk />
      </div>
    </>
  );
}

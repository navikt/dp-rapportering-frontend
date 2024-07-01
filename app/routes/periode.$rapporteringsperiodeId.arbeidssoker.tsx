import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import type { ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { lagreArbeidssokerSvar } from "~/models/arbeidssoker.server";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { LagretAutomatisk } from "~/components/LagretAutomatisk";
import { RemixLink } from "~/components/RemixLink";
import { ArbeidssokerRegisterering } from "~/components/arbeidssokerregister/ArbeidssokerRegister";

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const rapporteringsperiodeId = params.rapporteringsperiodeId;
  const formData = await request.formData();
  const svar = formData.get("registrertArbeidssoker");

  const registrertArbeidssoker = svar === "true" ? true : false;

  return await lagreArbeidssokerSvar(request, rapporteringsperiodeId, {
    registrertArbeidssoker,
  });
}

export default function RapporteringsPeriodeFyllUtSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { getAppText, getLink } = useSanity();

  return (
    <>
      <div className="rapportering-container">
        <ArbeidssokerRegisterering
          rapporteringsperiodeId={periode.id}
          registrertArbeidssoker={periode.registrertArbeidssoker}
        />
        <div className="navigasjon-container-to-knapper my-4">
          <RemixLink
            as="Button"
            to={`/`}
            variant="secondary"
            iconPosition="left"
            icon={<ArrowLeftIcon aria-hidden />}
            className="py-4 px-8"
          >
            {getLink("rapportering-periode-send-inn-tilbake").linkText}
          </RemixLink>

          <RemixLink
            as="Button"
            to={`/periode/${periode.id}/send-inn`}
            variant="primary"
            iconPosition="right"
            icon={<ArrowRightIcon aria-hidden />}
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

import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { lagreArbeidssokerSvar } from "~/models/arbeidssoker.server";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { useSanity } from "~/hooks/useSanity";
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

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const periodeId = params.rapporteringsperiodeId;
  const periode = await hentPeriode(request, periodeId, false);

  return json({ periode });
}

export default function ArbeidssøkerRegisterSide() {
  const { periode } = useLoaderData<typeof loader>();
  const { getAppText, getLink } = useSanity();

  const navigate = useNavigate();

  return (
    <>
      <ArbeidssokerRegisterering
        rapporteringsperiodeId={periode.id}
        registrertArbeidssoker={periode.registrertArbeidssoker}
      />
      <div className="navigasjon-container">
        <RemixLink
          as="Button"
          to={""}
          onClick={() => navigate(-1)}
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
          disabled={periode.registrertArbeidssoker === null}
        >
          {getAppText("rapportering-knapp-neste")}
        </RemixLink>
      </div>
      <LagretAutomatisk />
    </>
  );
}

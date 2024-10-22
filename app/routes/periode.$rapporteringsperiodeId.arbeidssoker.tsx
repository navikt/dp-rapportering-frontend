import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Button } from "@navikt/ds-react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { lagreArbeidssokerSvar } from "~/models/arbeidssoker.server";
import { useAmplitude } from "~/hooks/useAmplitude";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { KanIkkeSendes } from "~/components/KanIkkeSendes/KanIkkeSendes";
import { LagretAutomatisk } from "~/components/LagretAutomatisk";
import { RemixLink } from "~/components/RemixLink";
import { ArbeidssokerRegisterering } from "~/components/arbeidssokerregister/ArbeidssokerRegister";

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const rapporteringsperiodeId = params.rapporteringsperiodeId;
  const formData = await request.formData();
  const svar = formData.get("registrertArbeidssoker");

  const registrertArbeidssoker = svar === "true" ? true : false;

  return await lagreArbeidssokerSvar(request, rapporteringsperiodeId, {
    registrertArbeidssoker,
  });
}

export default function ArbeidssøkerRegisterSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { getAppText } = useSanity();

  const navigate = useNavigate();
  const { trackSkjemaSteg } = useAmplitude();

  const neste = () => {
    trackSkjemaSteg({
      skjemaId: periode.id,
      stegnavn: "arbeidssoker",
      steg: 4,
    });

    navigate(`/periode/${periode.id}/send-inn`);
  };

  return (
    <>
      <KanIkkeSendes periode={periode} />

      <ArbeidssokerRegisterering periode={periode} />
      <div className="navigasjon-container">
        <RemixLink
          as="Button"
          to={""}
          onClick={() => navigate(-1)}
          variant="secondary"
          iconPosition="left"
          icon={<ArrowLeftIcon aria-hidden />}
          className="navigasjonsknapp"
        >
          {getAppText("rapportering-knapp-tilbake")}
        </RemixLink>

        <Button
          size="medium"
          variant="primary"
          iconPosition="right"
          icon={<ArrowRightIcon aria-hidden />}
          className="navigasjonsknapp"
          disabled={periode.registrertArbeidssoker === null}
          onClick={neste}
        >
          {getAppText("rapportering-knapp-neste")}
        </Button>
      </div>
      <LagretAutomatisk />
    </>
  );
}

import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Button, Radio, RadioGroup } from "@navikt/ds-react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useFetcher, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { lagreArbeidssokerSvar } from "~/models/arbeidssoker.server";
import { kanSendes } from "~/utils/periode.utils";
import { INetworkResponse } from "~/utils/types";
import { useIsSubmitting } from "~/utils/useIsSubmitting";
import { useAmplitude } from "~/hooks/useAmplitude";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { Error } from "../components/error/Error";
import { LagretAutomatisk } from "~/components/LagretAutomatisk";
import { RemixLink } from "~/components/RemixLink";
import {
  AvregistertArbeidssokerAlert,
  RegistertArbeidssokerAlert,
} from "~/components/arbeidssokerregister/ArbeidssokerRegister";
import { KanIkkeSendes } from "~/components/kan-ikke-sendes/KanIkkeSendes";
import { NavigasjonContainer } from "~/components/navigasjon-container/NavigasjonContainer";
import navigasjonStyles from "~/components/navigasjon-container/NavigasjonContainer.module.css";

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const rapporteringsperiodeId = params.rapporteringsperiodeId;
  const formData = await request.formData();
  const svar = formData.get("registrertArbeidssoker");

  const registrertArbeidssoker = svar === "true" ? true : false;

  return lagreArbeidssokerSvar(request, rapporteringsperiodeId, {
    registrertArbeidssoker,
  });
}

export default function ArbeidssøkerRegisterSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { getAppText } = useSanity();
  const navigate = useNavigate();
  const fetcher = useFetcher<INetworkResponse>();
  const isSubmitting = useIsSubmitting(fetcher);

  const { trackSkjemaSteg } = useAmplitude();

  function neste() {
    trackSkjemaSteg({
      periode,
      stegnavn: "arbeidssoker",
      steg: 4,
    });

    navigate(`/periode/${periode.id}/send-inn`);
  }

  function handleChange(registrertArbeidssokerSvar: boolean) {
    if (kanSendes(periode)) {
      fetcher.submit(
        {
          registrertArbeidssoker: registrertArbeidssokerSvar,
          rapporteringsperiodeId: periode.id,
        },
        { method: "post" }
      );
    }
  }

  return (
    <>
      <KanIkkeSendes periode={periode} />

      <fetcher.Form method="post">
        <RadioGroup
          disabled={!kanSendes(periode)}
          legend={getAppText("rapportering-arbeidssokerregister-tittel")}
          description={getAppText("rapportering-arbeidssokerregister-subtittel")}
          onChange={handleChange}
          name="_action"
          value={periode.registrertArbeidssoker}
        >
          <Radio
            name="erRegistrertSomArbeidssoker"
            value={true}
            checked={periode.registrertArbeidssoker === true}
          >
            {getAppText("rapportering-arbeidssokerregister-svar-ja")}
          </Radio>
          <Radio
            name="erRegistrertSomArbeidssoker"
            value={false}
            checked={periode.registrertArbeidssoker === false}
          >
            {getAppText("rapportering-arbeidssokerregister-svar-nei")}
          </Radio>
        </RadioGroup>
      </fetcher.Form>

      {fetcher.data?.status === "error" && (
        <Error title={getAppText(fetcher.data.error.statusText)} />
      )}

      {periode.registrertArbeidssoker !== null &&
        (periode.registrertArbeidssoker ? (
          <RegistertArbeidssokerAlert />
        ) : (
          <AvregistertArbeidssokerAlert />
        ))}

      <NavigasjonContainer>
        <RemixLink
          as="Button"
          to={""}
          onClick={() => navigate(-1)}
          variant="secondary"
          iconPosition="left"
          icon={<ArrowLeftIcon aria-hidden />}
          className={navigasjonStyles.knapp}
        >
          {getAppText("rapportering-knapp-tilbake")}
        </RemixLink>

        <Button
          size="medium"
          variant="primary"
          iconPosition="right"
          icon={<ArrowRightIcon aria-hidden />}
          className={navigasjonStyles.knapp}
          disabled={periode.registrertArbeidssoker === null || isSubmitting}
          onClick={neste}
        >
          {getAppText("rapportering-knapp-neste")}
        </Button>
      </NavigasjonContainer>
      <LagretAutomatisk />
    </>
  );
}

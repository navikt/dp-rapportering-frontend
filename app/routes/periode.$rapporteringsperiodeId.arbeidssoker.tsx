import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Button, Radio, RadioGroup } from "@navikt/ds-react";
import { useEffect, useMemo } from "react";
import type { ActionFunctionArgs } from "react-router";
import { useFetcher, useNavigate } from "react-router";
import invariant from "tiny-invariant";
import { uuidv7 } from "uuidv7";

import { ArbeidssokerAlert } from "~/components/arbeidssokerregister/ArbeidssokerRegister";
import { KanIkkeSendes } from "~/components/kan-ikke-sendes/KanIkkeSendes";
import { LagretAutomatisk } from "~/components/LagretAutomatisk";
import { NavigasjonContainer } from "~/components/navigasjon-container/NavigasjonContainer";
import navigasjonStyles from "~/components/navigasjon-container/NavigasjonContainer.module.css";
import { useAnalytics } from "~/hooks/useAnalytics";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { lagreArbeidssokerSvar } from "~/models/arbeidssoker.server";
import { kanSendes, skalIkkeHaArbeidssokerSporsmal } from "~/utils/periode.utils";
import { INetworkResponse } from "~/utils/types";
import { useIsSubmitting } from "~/utils/useIsSubmitting";

import { Error } from "../components/error/Error";

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const rapporteringsperiodeId = params.rapporteringsperiodeId;
  const formData = await request.formData();
  const svar = formData.get("registrertArbeidssoker");

  const registrertArbeidssoker = svar === "true";

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

  const { trackSkjemaStegStartet, trackSkjemaStegFullført } = useAnalytics();
  const sesjonId = useMemo(uuidv7, [periode.id]);
  const stegnavn = "arbeidssoker";
  const steg = 4;

  function neste() {
    trackSkjemaStegFullført({
      periode,
      stegnavn,
      steg,
      sesjonId,
    });

    navigate(`/periode/${periode.id}/send-inn`);
  }

  useEffect(() => {
    trackSkjemaStegStartet({
      periode,
      stegnavn,
      steg,
      sesjonId,
    });
  }, []);

  function handleChange(registrertArbeidssokerSvar: boolean) {
    if (kanSendes(periode)) {
      fetcher.submit(
        {
          registrertArbeidssoker: registrertArbeidssokerSvar,
          rapporteringsperiodeId: periode.id,
        },
        { method: "post" },
      );
    }
  }

  return (
    <>
      <KanIkkeSendes periode={periode} />

      <fetcher.Form method="post">
        <RadioGroup
          disabled={!kanSendes(periode) || skalIkkeHaArbeidssokerSporsmal(periode) || isSubmitting}
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

      <ArbeidssokerAlert periode={periode} />

      <NavigasjonContainer>
        <Button
          onClick={() => navigate(-1)}
          variant="secondary"
          iconPosition="left"
          icon={<ArrowLeftIcon aria-hidden />}
          className={navigasjonStyles.knapp}
        >
          {getAppText("rapportering-knapp-tilbake")}
        </Button>

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

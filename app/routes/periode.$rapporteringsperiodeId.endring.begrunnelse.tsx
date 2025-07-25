import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Button, Select } from "@navikt/ds-react";
import { ChangeEvent, useEffect, useMemo } from "react";
import { ActionFunctionArgs } from "react-router";
import { useFetcher, useNavigate } from "react-router";
import { uuidv7 } from "uuidv7";

import { Error } from "~/components/error/Error";
import { KanIkkeSendes } from "~/components/kan-ikke-sendes/KanIkkeSendes";
import { LagretAutomatisk } from "~/components/LagretAutomatisk";
import { NavigasjonContainer } from "~/components/navigasjon-container/NavigasjonContainer";
import navigasjonStyles from "~/components/navigasjon-container/NavigasjonContainer.module.css";
import { ReactLink } from "~/components/ReactLink";
import { useAnalytics } from "~/hooks/useAnalytics";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { lagreBegrunnelse } from "~/models/begrunnelse.server";
import { kanSendes } from "~/utils/periode.utils";
import { INetworkResponse } from "~/utils/types";
import { useIsSubmitting } from "~/utils/useIsSubmitting";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;
  const begrunnelseEndring: string = formData.get("begrunnelseEndring") as string;

  return lagreBegrunnelse(request, rapporteringsperiodeId, begrunnelseEndring);
}

export default function BegrunnelseSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const fetcher = useFetcher<INetworkResponse>();
  const { getAppText, getLink } = useSanity();
  const isSubmitting = useIsSubmitting(fetcher);

  const navigate = useNavigate();
  const { trackSkjemaStegStartet, trackSkjemaStegFullført } = useAnalytics();
  const sesjonId = useMemo(uuidv7, [periode.id]);
  const stegnavn = "endring-begrunnelse";
  const steg = 2;

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;

    fetcher.submit(
      {
        rapporteringsperiodeId: periode.id,
        begrunnelseEndring: value,
      },
      { method: "post" },
    );
  };

  const begrunnelser = [
    { value: "", label: "rapportering-endring-begrunnelse-nedtrekksmeny-select" },
    { value: "rapportering-endring-begrunnelse-nedtrekksmeny-option-1" },
    { value: "rapportering-endring-begrunnelse-nedtrekksmeny-option-2" },
    { value: "rapportering-endring-begrunnelse-nedtrekksmeny-option-3" },
    { value: "rapportering-endring-begrunnelse-nedtrekksmeny-option-4" },
    { value: "rapportering-endring-begrunnelse-nedtrekksmeny-option-5" },
    { value: "rapportering-endring-begrunnelse-nedtrekksmeny-option-other" },
  ];

  const neste = () => {
    trackSkjemaStegFullført({
      periode,
      stegnavn,
      steg,
      endring: true,
      sesjonId,
    });

    navigate(`/periode/${periode.id}/endring/send-inn`);
  };

  useEffect(() => {
    trackSkjemaStegStartet({
      periode,
      stegnavn,
      steg,
      sesjonId,
    });
  }, []);

  return (
    <>
      <KanIkkeSendes periode={periode} />

      <Select
        label={getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-label")}
        description={getAppText("rapportering-endring-begrunnelse-nedtrekksmeny-description")}
        name="begrunnelseEndring"
        value={periode.begrunnelseEndring ?? undefined}
        onChange={handleChange}
        disabled={!kanSendes(periode)}
      >
        {begrunnelser.map((begrunnelse) => (
          <option key={begrunnelse.value} value={getAppText(begrunnelse.value)}>
            {getAppText(begrunnelse.label || begrunnelse.value)}
          </option>
        ))}
      </Select>

      {fetcher.data?.status === "error" && (
        <Error title={getAppText(fetcher.data.error.statusText)} />
      )}

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
          icon={<ArrowRightIcon aria-hidden />}
          iconPosition="right"
          className={navigasjonStyles.knapp}
          disabled={!periode.begrunnelseEndring || isSubmitting}
          onClick={neste}
        >
          {getAppText("rapportering-knapp-neste")}
        </Button>
      </NavigasjonContainer>
      <NavigasjonContainer>
        <ReactLink
          as="Button"
          to={getLink("rapportering-endre-avbryt").linkUrl}
          variant="tertiary"
          className={navigasjonStyles.knapp}
        >
          {getLink("rapportering-endre-avbryt").linkText}
        </ReactLink>
      </NavigasjonContainer>

      <LagretAutomatisk />
    </>
  );
}

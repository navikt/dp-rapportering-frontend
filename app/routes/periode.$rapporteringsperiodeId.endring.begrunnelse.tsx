import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Select } from "@navikt/ds-react";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { ChangeEvent } from "react";
import invariant from "tiny-invariant";
import { lagreBegrunnelse } from "~/models/begrunnelse.server";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { kanSendes } from "~/utils/periode.utils";
import { INetworkResponse } from "~/utils/types";
import { useSanity } from "~/hooks/useSanity";
import { KanIkkeSendes } from "~/components/KanIkkeSendes/KanIkkeSendes";
import { LagretAutomatisk } from "~/components/LagretAutomatisk";
import { RemixLink } from "~/components/RemixLink";
import { Error } from "~/components/error/Error";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;
  const begrunnelseEndring: string = formData.get("begrunnelseEndring") as string;

  return await lagreBegrunnelse(request, rapporteringsperiodeId, begrunnelseEndring);
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periodeId = params.rapporteringsperiodeId;
  const periode = await hentPeriode(request, periodeId, false);

  return json({ periode });
}

export default function BegrunnelseSide() {
  const { periode } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<INetworkResponse>();
  const { getAppText, getLink } = useSanity();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;

    fetcher.submit(
      {
        rapporteringsperiodeId: periode.id,
        begrunnelseEndring: value,
      },
      { method: "post" }
    );
  };

  const begrunnelser = [
    { value: "", label: "rapportering-endring-begrunnelse-nedtrekksmeny-select" },
    { value: "rapportering-endring-begrunnelse-nedtrekksmeny-option-1" },
    { value: "rapportering-endring-begrunnelse-nedtrekksmeny-option-2" },
    { value: "rapportering-endring-begrunnelse-nedtrekksmeny-option-3" },
    { value: "rapportering-endring-begrunnelse-nedtrekksmeny-option-4" },
    { value: "rapportering-endring-begrunnelse-nedtrekksmeny-option-5" },
    { value: "rapportering-endring-begrunnelse-nedtrekksmeny-option-6" },
    { value: "rapportering-endring-begrunnelse-nedtrekksmeny-option-other" },
  ];

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

      <div className="navigasjon-container">
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
      <div className="navigasjon-container">
        <RemixLink
          as="Button"
          to={getLink("rapportering-endre-avbryt").linkUrl}
          variant="tertiary"
          className="px-8"
        >
          {getLink("rapportering-endre-avbryt").linkText}
        </RemixLink>
      </div>

      <LagretAutomatisk />
    </>
  );
}

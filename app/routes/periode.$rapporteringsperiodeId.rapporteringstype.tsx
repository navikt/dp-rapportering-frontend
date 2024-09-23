import { ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Heading, Radio, RadioGroup } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import type { action as RapporteringstypeAction } from "./api.rapporteringstype";
import { hentPeriodeTekst } from "~/utils/periode.utils";
import { Rapporteringstype } from "~/utils/types";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { RemixLink } from "~/components/RemixLink";
import Center from "~/components/center/Center";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const rapporteringsperioder = await hentRapporteringsperioder(request);

    return json({ rapporteringsperioder });
  } catch (error: unknown) {
    if (error instanceof Response) {
      throw error;
    }

    throw new Response("Feil i uthenting av rapporteringsperioder", { status: 500 });
  }
}

export default function RapporteringstypeSide() {
  // TODO: Sjekk om bruker har rapporteringsperioder eller ikke
  const { rapporteringsperioder } = useLoaderData<typeof loader>();
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");

  const { getAppText, getLink, getRichText } = useSanity();

  const rapporteringstypeFetcher = useFetcher<typeof RapporteringstypeAction>();

  const antallPerioder = rapporteringsperioder.length;
  const harFlerePerioder = antallPerioder > 1;

  const [type, setType] = useState<Rapporteringstype | null>(periode.rapporteringstype);

  const rapporteringstypeFormLabel =
    rapporteringsperioder.length === 1
      ? getAppText("rapportering-rapporter-navarende-tittel")
      : getAppText("rapportering-ikke-utfylte-rapporter-tittel");

  const nesteKnappTekst =
    type === Rapporteringstype.harIngenAktivitet
      ? getAppText("rapportering-neste")
      : getAppText("rapportering-til-utfylling");

  const nesteKnappLink =
    type === Rapporteringstype.harIngenAktivitet
      ? `/periode/${periode.id}/arbeidssoker`
      : `/periode/${periode.id}/fyll-ut`;

  function endreRapporteringstype(valgtType: Rapporteringstype): void {
    setType(valgtType);
  }

  useEffect(() => {
    if (!type) {
      setType(Rapporteringstype.harAktivitet);
    }

    if (type) {
      rapporteringstypeFetcher.submit(
        { rapporteringstype: type, rapporteringsperiodeId: periode.id },
        { method: "post", action: "/api/rapporteringstype" }
      );
    }

    // Hvis du inkluderer rapporteringstypeFetcher i dep. array får du en uendelig løkke
  }, [type]);

  return (
    <>
      {harFlerePerioder && (
        <>
          <Alert variant="info" className="my-8">
            <Heading spacing size="small" level="2">
              {getAppText("rapportering-flere-perioder-tittel").replace(
                "{antall}",
                antallPerioder.toString()
              )}
            </Heading>
            {getAppText("rapportering-flere-perioder-innledning")}
          </Alert>
        </>
      )}

      <div className="my-8">
        {rapporteringsperioder.map((periode, index) => (
          <div key={periode.id} className="my-4">
            <Heading size="small" level="2">
              {index === 0 && getAppText("rapportering-naavaerende-periode")}
              {index === 1 && getAppText("rapportering-neste-periode")}
              {index > 1 && getAppText("rapportering-senere-periode")}
            </Heading>
            <BodyShort size="small">{hentPeriodeTekst(periode, getAppText)}</BodyShort>
          </div>
        ))}
      </div>

      <RadioGroup
        legend={rapporteringstypeFormLabel}
        description={hentPeriodeTekst(periode, getAppText)}
        onChange={endreRapporteringstype}
        value={type}
      >
        <Radio value={Rapporteringstype.harAktivitet}>
          {getAppText("rapportering-noe-å-rapportere")}
        </Radio>
        <Radio
          data-testid="rapportering-ingen-å-rapportere"
          className="rapportering-ingen-å-rapportere"
          value={Rapporteringstype.harIngenAktivitet}
        >
          <PortableText value={getRichText("rapportering-ingen-å-rapportere")} />
        </Radio>
      </RadioGroup>

      <Center>
        <RemixLink
          as="Button"
          to={nesteKnappLink}
          variant="primary"
          iconPosition="right"
          className="py-4 px-8"
          icon={<ArrowRightIcon aria-hidden />}
        >
          {nesteKnappTekst}
        </RemixLink>
      </Center>

      <Center>
        <RemixLink className="my-8" as="Link" to={getLink("rapportering-se-og-endre").linkUrl}>
          {getLink("rapportering-se-og-endre").linkText}
        </RemixLink>
      </Center>
    </>
  );
}
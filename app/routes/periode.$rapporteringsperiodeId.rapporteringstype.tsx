import { ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Heading, Radio, RadioGroup } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { addDays } from "date-fns";
import { useEffect, useState } from "react";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import { getSanityPortableTextComponents } from "~/sanity/sanityPortableTextComponents";
import type { action as RapporteringstypeAction } from "./api.rapporteringstype";
import { formaterDato } from "~/utils/dato.utils";
import { hentPeriodeTekst } from "~/utils/periode.utils";
import { Rapporteringstype } from "~/utils/types";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { LesMer } from "~/components/LesMer";
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

  const { getAppText, getRichText } = useSanity();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const tidligstInnsendingDato = formaterDato(new Date(periode.kanSendesFra));
  const senestInnsendingDato = formaterDato(addDays(new Date(periode.periode.fraOgMed), 21));

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

      <Heading size="medium" level="2">
        {rapporteringsperioder.length > 1 && getAppText("rapportering-foerste-periode")}
        {rapporteringsperioder.length === 1 && getAppText("rapportering-naavaerende-periode")}
      </Heading>
      <p>{hentPeriodeTekst(periode, getAppText)}</p>

      <PortableText
        components={getSanityPortableTextComponents({
          "fra-dato": tidligstInnsendingDato,
          "til-dato": senestInnsendingDato,
        })}
        value={getRichText("rapportering-fyll-ut-frister")}
      />

      <LesMer />

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
    </>
  );
}

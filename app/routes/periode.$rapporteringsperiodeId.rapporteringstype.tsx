import { ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Heading, Radio, RadioGroup } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { addDays } from "date-fns";
import { useCallback } from "react";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import { getSanityPortableTextComponents } from "~/sanity/sanityPortableTextComponents";
import type { action as RapporteringstypeAction } from "./api.rapporteringstype";
import { formaterDato } from "~/utils/dato.utils";
import { hentPeriodeTekst } from "~/utils/periode.utils";
import { Rapporteringstype } from "~/utils/types";
import { useSanity } from "~/hooks/useSanity";
import { LesMer } from "~/components/LesMer";
import { RemixLink } from "~/components/RemixLink";
import Center from "~/components/center/Center";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const rapporteringsperioder = await hentRapporteringsperioder(request);
    const gjeldendePeriode = rapporteringsperioder[0];
    return json({ rapporteringsperioder, gjeldendePeriode });
  } catch (error: unknown) {
    if (error instanceof Response) {
      throw error;
    }

    throw new Response("Feil i uthenting av rapporteringsperioder", { status: 500 });
  }
}

export default function RapporteringstypeSide() {
  // TODO: Sjekk om bruker har rapporteringsperioder eller ikke
  const { gjeldendePeriode, rapporteringsperioder } = useLoaderData<typeof loader>();
  const { getAppText, getRichText } = useSanity();

  const rapporteringstypeFetcher = useFetcher<typeof RapporteringstypeAction>();

  const antallPerioder = rapporteringsperioder.length;
  const harFlerePerioder = antallPerioder > 1;

  const type = gjeldendePeriode.rapporteringstype;

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
      ? `/periode/${gjeldendePeriode.id}/arbeidssoker`
      : `/periode/${gjeldendePeriode.id}/fyll-ut`;

  const endreRapporteringstype = useCallback(
    (valgtType: Rapporteringstype) => {
      rapporteringstypeFetcher.submit(
        { rapporteringstype: valgtType, rapporteringsperiodeId: gjeldendePeriode.id },
        { method: "post", action: "/api/rapporteringstype" }
      );
    },
    [gjeldendePeriode.id, rapporteringstypeFetcher]
  );

  const tidligstInnsendingDato = formaterDato(new Date(gjeldendePeriode.kanSendesFra));
  const senestInnsendingDato = formaterDato(
    addDays(new Date(gjeldendePeriode.periode.fraOgMed), 21)
  );

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
      <p>{hentPeriodeTekst(gjeldendePeriode, getAppText)}</p>

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
        description={hentPeriodeTekst(gjeldendePeriode, getAppText)}
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

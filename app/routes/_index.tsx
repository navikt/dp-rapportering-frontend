import { PencilIcon } from "@navikt/aksel-icons";
import { BodyLong, BodyShort, Heading, Label, Radio, RadioGroup, ReadMore } from "@navikt/ds-react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { getSession } from "~/models/getSession.server";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentGjeldendePeriode } from "~/models/rapporteringsperiode.server";
import { getRapporteringOboToken } from "~/utils/auth.utils.server";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";
import { getEnv } from "~/utils/env.utils";
import { useSanity } from "~/hooks/useSanity";
import { useSetFokus } from "~/hooks/useSetFokus";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import { RemixLink } from "~/components/RemixLink";
import Center from "~/components/center/Center";
import { DevelopmentContainer } from "~/components/development-container/DevelopmentContainer";
import { SessionModal } from "~/components/session-modal/SessionModal";

export async function loader({ request }: LoaderFunctionArgs) {
  let gjeldendePeriode: IRapporteringsperiode | null = null;

  const onBehalfOfToken = await getRapporteringOboToken(request);
  const gjeldendePeriodeResponse = await hentGjeldendePeriode(onBehalfOfToken);

  const session = await getSession(request);

  if (!gjeldendePeriodeResponse.ok) {
    if (gjeldendePeriodeResponse.status !== 404)
      throw new Response("Feil i uthenting av gjeldende periode", {
        status: 500,
      });
  } else {
    gjeldendePeriode = await gjeldendePeriodeResponse.json();
  }

  return json({ gjeldendePeriode, session });
}

export default function Landingsside() {
  const { gjeldendePeriode } = useLoaderData<typeof loader>();

  const sidelastFokusRef = useRef(null);
  const { setFokus } = useSetFokus();
  const { scrollToView } = useScrollToView();
  const { getAppText, getLink } = useSanity();

  useEffect(() => {
    scrollToView(sidelastFokusRef);
    setFokus(sidelastFokusRef);
  }, [setFokus, scrollToView]);

  let invaerendePeriodeTekst;

  if (gjeldendePeriode) {
    const ukenummer = formaterPeriodeTilUkenummer(
      gjeldendePeriode.periode.fraOgMed,
      gjeldendePeriode.periode.tilOgMed
    );
    const dato = formaterPeriodeDato(
      gjeldendePeriode.periode.fraOgMed,
      gjeldendePeriode.periode.tilOgMed
    );

    invaerendePeriodeTekst = `Uke ${ukenummer} (${dato})`;
  }

  return (
    <>
      <div className="rapportering-header">
        <div className="rapportering-header-innhold">
          <Heading
            ref={sidelastFokusRef}
            tabIndex={-1}
            level="1"
            size="xlarge"
            className="vo-fokus"
          >
            {getAppText("rapportering-tittel")}
          </Heading>
        </div>
      </div>
      <div className="rapportering-container">
        <BodyLong size="small">
          For å motta dagpenger må du rapportere hver 14. dag (periode) hvor mye du har jobbet, om
          du har vært syk, hatt ferie/fravær eller deltatt på kurs/utdanning. NAV trenger dette for
          å beregne hvor mye du skal ha i dagpenger.
        </BodyLong>
        <br />
        <BodyLong size="small">
          Husk at for å få dagpenger må du også rapportere mens du venter på svar på søknaden din.
        </BodyLong>
        <br />
        {/* <PortableText value={getRichText("rapportering-innledning")} /> */}
        <Label size="small">
          {/* {getAppText("rapportering-ikke-utfylte-rapporter-tittel")} */}
          Har du noe å rapportere for nåværende periode?
        </Label>

        {!gjeldendePeriode && <>{getAppText("rapportering-ingen-rapporter-å-fylle-ut")}</>}

        {gjeldendePeriode && (
          <div>
            <BodyShort size="small">{invaerendePeriodeTekst}</BodyShort>
            <RadioGroup legend="" onChange={console.log}>
              <Radio value="10">Ja, jeg har noe å rapportere</Radio>
              <Radio value="20">
                Nei, jeg har <b>ikke</b> jobbet, vært sykt, hatt fravær/ferie eller deltatt på
                kurs/utdanning
              </Radio>
            </RadioGroup>

            <ReadMore header="Les mer om hva som skal rapporteres">
              Med helsemessige begrensninger mener vi funksjonshemming, sykdom, allergier som
              hindrer deg i arbeidet eller andre årsaker som må tas hensyn til når du skal finne
              nytt arbeid. Du må oppgi hva som gjelder for deg, og dokumentere de helsemessige
              årsakene du viser til.
            </ReadMore>

            <Center>
              <RemixLink
                size="medium"
                as="Button"
                to={`/periode/${gjeldendePeriode.id}/fyll-ut`}
                className="my-18"
                icon={<PencilIcon aria-hidden />}
                iconPosition="right"
              >
                {/* {getLink("rapportering-rapporter-for-perioden").linkText} */}
                Til utfylling
              </RemixLink>
            </Center>
          </div>
        )}
        <p>
          <RemixLink as="Link" to={getLink("rapportering-se-og-korriger").linkUrl}>
            {getLink("rapportering-se-og-korriger").linkText}
          </RemixLink>
        </p>
      </div>
      <SessionModal />
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const { getAppText } = useSanity();

  if (isRouteErrorResponse(error)) {
    if (getEnv("IS_LOCALHOST") === "true" && error.status === 440) {
      return (
        <main>
          <div className="rapportering-header">
            <div className="rapportering-header-innhold">
              <Heading level="1" size="xlarge">
                Dagpengerapportering
              </Heading>
            </div>
          </div>
          <div className="rapportering-container">
            <DevelopmentContainer>
              <>
                Sesjon utløpt! &nbsp;
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://tokenx-token-generator.intern.dev.nav.no/api/obo?aud=dev-gcp:teamdagpenger:dp-rapportering"
                >
                  Klikk på lenken for å hente ny token
                </a>
              </>
            </DevelopmentContainer>
          </div>
        </main>
      );
    }

    return (
      <main>
        <div className="rapportering-header">
          <div className="rapportering-header-innhold">
            <Heading level="1" size="xlarge">
              {getAppText("rapportering-tittel")}
            </Heading>
          </div>
        </div>
        <div className="rapportering-container">
          <Heading level="2" size="medium">
            {error.status} {error.statusText}
          </Heading>
          <p>{error.data}</p>
        </div>
      </main>
    );
  }
}

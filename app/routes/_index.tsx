import { ArrowRightIcon } from "@navikt/aksel-icons";
import { BodyLong, Heading, Radio, RadioGroup, ReadMore } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { DevTools } from "~/devTools";
import { lagreArbeidssokerSvar } from "~/models/arbeidssoker.server";
import { getSession } from "~/models/getSession.server";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentGjeldendePeriode } from "~/models/rapporteringsperiode.server";
import { getRapporteringOboToken } from "~/utils/auth.utils.server";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";
import { getEnv } from "~/utils/env.utils";
import { RapporteringType, useRapporteringType } from "~/hooks/RapporteringType";
import { useSanity } from "~/hooks/useSanity";
import { useSetFokus } from "~/hooks/useSetFokus";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { RemixLink } from "~/components/RemixLink";
import { ArbeidssokerRegister } from "~/components/arbeidssokerregister/ArbeidssokerRegister";
import Center from "~/components/center/Center";
import { DevelopmentContainer } from "~/components/development-container/DevelopmentContainer";
import { SessionModal } from "~/components/session-modal/SessionModal";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;
  const svar = formData.get("registrertArbeidssoker");

  const registrertArbeidssoker = svar === "true" ? true : false;

  const onBehalfOfToken = await getRapporteringOboToken(request);

  return await lagreArbeidssokerSvar(onBehalfOfToken, rapporteringsperiodeId, {
    registrertArbeidssoker,
  });
}
export async function loader({ request }: LoaderFunctionArgs) {
  let gjeldendePeriode: IRapporteringsperiode | null = null;

  const gjeldendePeriodeResponse = await hentGjeldendePeriode(request);

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
  const { isLocalOrDemo } = useTypedRouteLoaderData("root");

  const { rapporteringType, setRapporteringType } = useRapporteringType();

  const sidelastFokusRef = useRef(null);
  const { setFokus } = useSetFokus();
  const { scrollToView } = useScrollToView();
  const { getAppText, getLink, getRichText } = useSanity();

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
          {isLocalOrDemo && <DevTools />}
        </div>
      </div>
      <div className="rapportering-container">
        <BodyLong>
          <PortableText value={getRichText("rapportering-innledning")} />
        </BodyLong>

        {!gjeldendePeriode && <>{getAppText("rapportering-ingen-rapporter-å-fylle-ut")}</>}
        {gjeldendePeriode && (
          <div>
            <RadioGroup
              description={invaerendePeriodeTekst}
              legend={getAppText("rapportering-ikke-utfylte-rapporter-tittel")}
              onChange={setRapporteringType}
              value={rapporteringType}
            >
              <Radio value={RapporteringType.harAktivitet}>
                {getAppText("rapportering-noe-å-rapportere")}
              </Radio>
              <Radio value={RapporteringType.harIngenAktivitet}>
                {getAppText("rapportering-ingen-å-rapportere")}
              </Radio>
            </RadioGroup>

            <ReadMore header="Les mer om hva som skal rapporteres">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias pariatur, explicabo
              quisquam harum aspernatur ex, officiis doloremque atque tempora tenetur distinctio
              quasi doloribus voluptatum aliquid ipsam! In dolore consectetur quae iusto porro ipsum
              culpa nemo velit error eos assumenda illo omnis, amet, excepturi sit qui, ab quia
              voluptates cum fugit.
            </ReadMore>

            {rapporteringType === "harIngenAktivitet" && (
              <ArbeidssokerRegister
                rapporteringsperiodeId={gjeldendePeriode.id}
                registrertArbeidssoker={gjeldendePeriode.registrertArbeidssoker}
              />
            )}

            {rapporteringType && (
              <Center>
                <RemixLink
                  size="medium"
                  as="Button"
                  to={
                    rapporteringType === RapporteringType.harAktivitet
                      ? `/periode/${gjeldendePeriode.id}/fyll-ut`
                      : `/periode/${gjeldendePeriode.id}/send-inn`
                  }
                  className="my-18 py-4 px-16"
                  icon={<ArrowRightIcon aria-hidden />}
                  iconPosition="right"
                  disabled={!rapporteringType}
                >
                  {rapporteringType === RapporteringType.harAktivitet
                    ? getLink("rapportering-rapporter-for-perioden").linkText
                    : getAppText("rapportering-knapp-neste")}
                </RemixLink>
              </Center>
            )}
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

import { ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, BodyLong, BodyShort, Heading, Radio, RadioGroup, ReadMore } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import { withDb } from "mocks/responses/db";
import { getSessionId, sessionRecord } from "mocks/session";
import { DevTools, ScenerioType } from "~/devTools";
import { lagreArbeidssokerSvar } from "~/models/arbeidssoker.server";
import { getSession } from "~/models/getSession.server";
import {
  IRapporteringsperiode,
  hentRapporteringsperioder,
} from "~/models/rapporteringsperiode.server";
import { getEnv, isLocalOrDemo } from "~/utils/env.utils";
import { hentForstePeriodeTekst } from "~/utils/periode.utils";
import { RapporteringType, useRapporteringType } from "~/hooks/RapporteringType";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { RemixLink } from "~/components/RemixLink";
import { ArbeidssokerRegisterering } from "~/components/arbeidssokerregister/ArbeidssokerRegister";
import Center from "~/components/center/Center";
import { DevelopmentContainer } from "~/components/development-container/DevelopmentContainer";
import { SessionModal } from "~/components/session-modal/SessionModal";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  if (isLocalOrDemo && formData.get("scenerio")) {
    const { scenerio } = Object.fromEntries(formData);
    const sessionId = getSessionId(request);

    if (sessionId) {
      withDb(sessionRecord.getDatabase(sessionId)).updateRapporteringsperioder(
        scenerio as ScenerioType
      );

      return { status: "success" };
    }
  }

  if (formData.get("registrertArbeidssoker")) {
    const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;
    const registrertArbeidssoker: boolean = formData.get("registrertArbeidssoker") === "true";

    return await lagreArbeidssokerSvar(request, rapporteringsperiodeId, {
      registrertArbeidssoker,
    });
  }
}
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  const rapporteringsperioderResponse = await hentRapporteringsperioder(request);

  if (rapporteringsperioderResponse.ok) {
    const rapporteringsperioder = await rapporteringsperioderResponse.json();
    return json({ rapporteringsperioder, session });
  }

  throw new Response("Feil i uthenting av rapporteringsperioder", { status: 500 });
}

export default function Landingsside() {
  const { rapporteringsperioder } = useLoaderData<typeof loader>();
  const { isLocalOrDemo } = useTypedRouteLoaderData("root");

  const { rapporteringType, setRapporteringType } = useRapporteringType();

  const { getLink, getRichText } = useSanity();

  const harPeriode = rapporteringsperioder.length > 0;
  const forstePeriode = harPeriode ? rapporteringsperioder[0] : null;
  const visArbeidssokerRegisterering = rapporteringType === RapporteringType.harIngenAktivitet;

  return (
    <>
      <Header isLocalOrDemo={isLocalOrDemo} />
      <div className="rapportering-container">
        <BodyLong>
          <PortableText value={getRichText("rapportering-innledning")} />
        </BodyLong>

        <PeriodeDetaljer rapporteringsperioder={rapporteringsperioder} />

        {harPeriode && (
          <div>
            <RapporteringstypeForm type={rapporteringType} setType={setRapporteringType} />

            <ReadMore header="Les mer om hva som skal rapporteres">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias pariatur, explicabo
              quisquam harum aspernatur ex, officiis doloremque atque tempora tenetur distinctio
              quasi doloribus voluptatum aliquid ipsam! In dolore consectetur quae iusto porro ipsum
              culpa nemo velit error eos assumenda illo omnis, amet, excepturi sit qui, ab quia
              voluptates cum fugit.
            </ReadMore>

            {visArbeidssokerRegisterering && (
              <div className="my-8">
                <ArbeidssokerRegisterering
                  rapporteringsperiodeId={forstePeriode.id}
                  registrertArbeidssoker={forstePeriode.registrertArbeidssoker}
                />
              </div>
            )}

            <NextButton
              rappporteringstype={rapporteringType}
              rapporteringsPeriode={forstePeriode}
            />
          </div>
        )}
        <div>
          <RemixLink className="my-8" as="Link" to={getLink("rapportering-se-og-korriger").linkUrl}>
            {getLink("rapportering-se-og-korriger").linkText}
          </RemixLink>
        </div>
      </div>
      <SessionModal />
    </>
  );
}

function Header({ isLocalOrDemo }: { isLocalOrDemo: boolean }) {
  const { getAppText } = useSanity();
  return (
    <div className="rapportering-header">
      <div className="rapportering-header-innhold">
        <Heading tabIndex={-1} level="1" size="xlarge" className="vo-fokus">
          {getAppText("rapportering-tittel")}
        </Heading>
        {isLocalOrDemo && <DevTools />}
      </div>
    </div>
  );
}

function PeriodeDetaljer({
  rapporteringsperioder,
}: {
  rapporteringsperioder: IRapporteringsperiode[];
}) {
  const { getAppText } = useSanity();

  const antallPerioder = rapporteringsperioder.length;
  const harFlerePerioder = antallPerioder > 1;

  if (antallPerioder > 0) {
    return (
      <div className="my-8">
        {harFlerePerioder && (
          <Alert variant="info" className="my-8">
            <Heading spacing size="small" level="3">
              {getAppText("rapportering-flere-perioder-tittel").replace(
                "{antall}",
                antallPerioder.toString()
              )}
            </Heading>
            {getAppText("rapportering-flere-perioder-innledning")}
          </Alert>
        )}
        <Heading size="small">
          {antallPerioder > 1
            ? getAppText("rapportering-forste-periode")
            : getAppText("rapportering-navaerende-periode")}
        </Heading>
        <BodyShort textColor="subtle">{hentForstePeriodeTekst(rapporteringsperioder)}</BodyShort>
      </div>
    );
  }
  return <>{getAppText("rapportering-ingen-rapporter-å-fylle-ut")}</>;
}

function RapporteringstypeForm({
  type,
  setType,
}: {
  type: RapporteringType | undefined;
  setType: (value: RapporteringType) => void;
}) {
  const { getAppText } = useSanity();

  return (
    <div>
      <RadioGroup
        legend={getAppText("rapportering-ikke-utfylte-rapporter-tittel")}
        description={getAppText("rapportering-ikke-utfylte-rapporter-subtittel")}
        onChange={setType}
        value={type}
      >
        <Radio value={RapporteringType.harAktivitet}>
          {getAppText("rapportering-noe-å-rapportere")}
        </Radio>
        <Radio value={RapporteringType.harIngenAktivitet}>
          {getAppText("rapportering-ingen-å-rapportere")}
        </Radio>
      </RadioGroup>
    </div>
  );
}

export function NextButton({
  rappporteringstype,
  rapporteringsPeriode,
}: {
  rappporteringstype: RapporteringType | undefined;
  rapporteringsPeriode: IRapporteringsperiode;
}) {
  const { getAppText, getLink } = useSanity();

  if (!rappporteringstype) return null;

  return (
    <Center>
      <RemixLink
        size="medium"
        as="Button"
        to={
          rappporteringstype === RapporteringType.harAktivitet
            ? `/periode/${rapporteringsPeriode.id}/fyll-ut`
            : `/periode/${rapporteringsPeriode.id}/send-inn`
        }
        className="my-18 py-4 px-16"
        icon={<ArrowRightIcon aria-hidden />}
        iconPosition="right"
        disabled={!rappporteringstype}
      >
        {rappporteringstype === RapporteringType.harAktivitet
          ? getLink("rapportering-rapporter-for-perioden").linkText
          : getAppText("rapportering-knapp-neste")}
      </RemixLink>
    </Center>
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
                {getAppText("rapportering-tittel")}
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

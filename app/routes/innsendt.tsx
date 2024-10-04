import { Accordion, Alert, BodyLong, BodyShort, Heading } from "@navikt/ds-react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { hentInnsendtePerioder } from "~/models/rapporteringsperiode.server";
import { baseUrl, setBreadcrumbs } from "~/utils/dekoratoren.utils";
import { hentUkeTekst } from "~/utils/periode.utils";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import Center from "~/components/center/Center";
import { Kalender } from "~/components/kalender/Kalender";

export async function loader({ request }: LoaderFunctionArgs) {
  const innsendtPerioder = await hentInnsendtePerioder(request);

  return json({ innsendtPerioder });
}

export default function InnsendteRapporteringsPerioderSide() {
  const { innsendtPerioder } = useLoaderData<typeof loader>();
  const { locale } = useTypedRouteLoaderData("root");

  const { getAppText } = useSanity();

  useEffect(() => {
    setBreadcrumbs(
      [
        {
          title: "rapportering-brodsmule-innsendte-meldekort",
          url: `${baseUrl}/periode/innsendt`,
          handleInApp: true,
        },
      ],
      getAppText
    );
  }, [getAppText]);

  // Det er et problem med "Intl.NumberFormat" og SSR, vi får feilmeldingen:
  // > Text content did not match. Server: "kr 8 632,00" Client: "8 632,00 kr"
  // Det er mest sannsynlig pga. forskjeller i JS-motor i nettleser og på serveren
  // ref. https://github.com/nodejs/node/issues/39056

  return (
    <>
      <Heading size="medium" level="2">
        {getAppText("rapportering-innsendt-beskrivelse-tittel")}
      </Heading>
      <BodyLong className="tekst-subtil" spacing>
        {getAppText("rapportering-innsendt-beskrivelse-innhold")}
      </BodyLong>
      {innsendtPerioder.length === 0 && (
        <Alert variant="info">{getAppText("rapportering-innsendt-ingen-innsendte")}</Alert>
      )}
      {innsendtPerioder.map((periode) => {
        const flatMapAktiviteter = periode.dager.flatMap((d) => d.aktiviteter);
        return (
          <Accordion key={periode.id} headingSize="medium">
            <Accordion.Item>
              <Accordion.Header className="innsendt-accordion-header">
                <div className="innsendt-periode-header">
                  <div className="innsendt-periode-header-uke">
                    {hentUkeTekst(periode, getAppText)}
                  </div>
                  <div
                    className={`innsendt-periode-header-status ${periode.status.toLocaleLowerCase()}`}
                  >
                    <BodyShort>
                      {getAppText(`rapportering-status-${periode.status.toLocaleLowerCase()}`)}
                    </BodyShort>
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Content>
                <div className="oppsummering">
                  {(periode.mottattDato || periode.bruttoBelop) && (
                    <div className="my-4">
                      {periode.mottattDato && (
                        <div>
                          <strong>Sendt:</strong>{" "}
                          {new Intl.DateTimeFormat(locale).format(new Date(periode.mottattDato))}
                        </div>
                      )}
                      {periode.bruttoBelop && (
                        <div>
                          <strong>Bruttobeløp:</strong>{" "}
                          {new Intl.NumberFormat(locale, {
                            style: "currency",
                            currency: "NOK",
                          }).format(periode.bruttoBelop)}
                        </div>
                      )}
                    </div>
                  )}
                  <Kalender
                    key={periode.id}
                    rapporteringsperiode={periode}
                    visEndringslenke={periode.kanEndres}
                    aapneModal={() => {}}
                    readonly
                  />
                  {flatMapAktiviteter.length < 1 && (
                    <p>{getAppText("rapportering-innsendt-ikke-fravaer")}</p>
                  )}
                  <AktivitetOppsummering rapporteringsperiode={periode} />
                </div>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        );
      })}

      <Center className="my-8">
        <RemixLink as="Button" to="/" className="py-4 px-8">
          {getAppText("rapportering-knapp-tilbake-til-start")}
        </RemixLink>
      </Center>
    </>
  );
}

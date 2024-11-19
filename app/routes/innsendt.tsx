import { Accordion, Alert, Button, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import {
  IRapporteringsperiode,
  hentInnsendtePerioder,
  hentRapporteringsperioder,
} from "~/models/rapporteringsperiode.server";
import { formaterPeriodeDato } from "~/utils/dato.utils";
import { baseUrl, setBreadcrumbs } from "~/utils/dekoratoren.utils";
import { sorterGrupper } from "~/utils/innsendt.utils";
import { hentUkeTekst, perioderSomKanSendes } from "~/utils/periode.utils";
import { useLocale } from "~/hooks/useLocale";
import { useSanity } from "~/hooks/useSanity";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import {
  AvregistertArbeidssokerAlert,
  RegistertArbeidssokerAlert,
} from "~/components/arbeidssokerregister/ArbeidssokerRegister";
import { Kalender } from "~/components/kalender/Kalender";

export async function loader({ request }: LoaderFunctionArgs) {
  const rapporteringsperioder = await hentRapporteringsperioder(request);
  const innsendtPerioder = await hentInnsendtePerioder(request);

  return json({ innsendtPerioder, rapporteringsperioder });
}

function grupperPerioder(
  perioder: { [key: string]: IRapporteringsperiode[] },
  periode: IRapporteringsperiode
): { [key: string]: IRapporteringsperiode[] } {
  const { fraOgMed } = periode.periode;

  if (!perioder[fraOgMed]) {
    perioder[fraOgMed] = [];
  }

  perioder[fraOgMed].push(periode);

  return perioder;
}

export default function InnsendteRapporteringsPerioderSide() {
  const { innsendtPerioder, rapporteringsperioder } = useLoaderData<typeof loader>();
  const { locale } = useLocale();

  const antallPerioder = perioderSomKanSendes(rapporteringsperioder).length;
  const harFlerePerioder = antallPerioder >= 1;

  const gruppertePerioder = innsendtPerioder.reduce(grupperPerioder, {});
  const sortertePeriodeNokler = Object.keys(gruppertePerioder).sort((a, b) => b.localeCompare(a));
  const sortertePerioder = sortertePeriodeNokler
    .map((nokkel) => gruppertePerioder[nokkel])
    .map(sorterGrupper);

  const { getAppText, getLink, getRichText } = useSanity();

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

      <PortableText value={getRichText("rapportering-innsendt-beskrivelse-innhold")} />

      {innsendtPerioder.length === 0 && (
        <Alert variant="info">{getAppText("rapportering-innsendt-ingen-innsendte")}</Alert>
      )}

      {sortertePerioder.map((perioder) => {
        const nyestePeriode = perioder[0];
        return (
          <Accordion key={nyestePeriode.periode.fraOgMed} headingSize="medium">
            <Accordion.Item>
              <Accordion.Header className="innsendt-accordion-header">
                <div className="innsendt-periode-header">
                  <div>
                    <div className="innsendt-periode-header-uke">
                      {hentUkeTekst(nyestePeriode, getAppText)}
                    </div>
                    <div className="innsendt-periode-header-dato">
                      {formaterPeriodeDato(
                        nyestePeriode.periode.fraOgMed,
                        nyestePeriode.periode.tilOgMed
                      )}
                    </div>
                  </div>
                  <div
                    className={`innsendt-periode-header-status ${nyestePeriode.status.toLocaleLowerCase()}`}
                  >
                    {getAppText(`rapportering-status-${nyestePeriode.status.toLocaleLowerCase()}`)}
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Content className="innsendt-accordion-content">
                {perioder.map((periode) => {
                  return (
                    <div key={periode.id} className="innsendt-oppsummering oppsummering">
                      {(periode.mottattDato || periode.bruttoBelop) && (
                        <div className="my-4">
                          {periode.mottattDato && (
                            <div>
                              <strong>
                                {periode.originalId
                                  ? getAppText("rapportering-endret")
                                  : getAppText("rapportering-sendt")}
                                :{" "}
                              </strong>
                              {new Intl.DateTimeFormat(locale).format(
                                new Date(periode.mottattDato)
                              )}
                            </div>
                          )}
                          {periode.bruttoBelop !== null && (
                            <div>
                              <strong>{getAppText("rapportering-bruttobelop")}: </strong>
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
                        periode={periode}
                        visEndringslenke={periode.kanEndres}
                        aapneModal={() => {}}
                        locale={locale}
                        readonly
                        visDato={false}
                      />
                      <AktivitetOppsummering periode={periode} />
                      {periode.registrertArbeidssoker ? (
                        <RegistertArbeidssokerAlert />
                      ) : (
                        <AvregistertArbeidssokerAlert />
                      )}
                    </div>
                  );
                })}
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        );
      })}

      <div className="navigasjon-container">
        {harFlerePerioder ? (
          <RemixLink
            as="Button"
            to={getLink("rapportering-ga-til-neste-meldekort").linkUrl}
            className="navigasjonsknapp"
          >
            {getLink("rapportering-ga-til-neste-meldekort").linkText}
          </RemixLink>
        ) : (
          <Button
            as="a"
            className="navigasjonsknapp"
            href={getLink("rapportering-ga-til-mine-dagpenger").linkUrl}
          >
            {getLink("rapportering-ga-til-mine-dagpenger").linkText}
          </Button>
        )}
      </div>
    </>
  );
}

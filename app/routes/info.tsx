import { Accordion, BodyLong, Heading, Link, List } from "@navikt/ds-react";
import { useNavigate } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useSetFokus } from "~/hooks/useSetFokus";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import { RemixLink } from "~/components/RemixLink";

export default function Infoside() {
  const navigate = useNavigate();
  const tilbake = () => navigate(-1);

  const sidelastFokusRef = useRef(null);
  const { setFokus } = useSetFokus();
  const { scrollToView } = useScrollToView();

  useEffect(() => {
    scrollToView(sidelastFokusRef);
    setFokus(sidelastFokusRef);
  }, [setFokus, scrollToView]);

  return (
    <>
      <div className="rapportering-header">
        <div className="rapportering-header-innhold">
          <Heading level="1" size="xlarge">
            Dine dagpenger
          </Heading>
        </div>
      </div>
      <div className="rapportering-container">
        <Heading ref={sidelastFokusRef} tabIndex={-1} className="vo-fokus" size="medium" level="2">
          Hva skal jeg rapportere til NAV?
        </Heading>
        <BodyLong spacing>
          Her kan du lese om hva du skal rapportere til NAV når du mottar dagpenger. Det er lurt å
          gjøre seg godt kjent med hvordan rapporteringen fungerer.
        </BodyLong>
        <Accordion>
          <Accordion.Item>
            <Accordion.Header>Hva må jeg rapportere som arbeid?</Accordion.Header>
            <Accordion.Content>
              <List as="ul" title="Arbeid">
                <List.Item>Alle timer du har jobbet i perioden føres på meldekortet.</List.Item>
                <List.Item>
                  Timene rundes av til nærmeste halve time, er det midt mellom to halve timer,
                  runder du nedover.
                </List.Item>
                <List.Item>
                  Inntektsgivende arbeid skal føres i den perioden arbeidet er utført, selv om
                  inntekten kommer senere.
                </List.Item>
                <List.Item>
                  Får du lønn for flere timer enn du jobbet, skal du føre alle timene du får lønn
                  for.
                </List.Item>
              </List>
              <Heading size="small" level="3">
                Utbetalt lunsj
              </Heading>
              <BodyLong spacing>Regnes ikke som arbeid, skal ikke føres på meldekortet.</BodyLong>
              <Heading size="small" level="3">
                Avspasering
              </Heading>
              <BodyLong spacing>Føres som om du var på jobb.</BodyLong>
              <Heading size="small" level="3">
                Hva regnes som arbeid?
              </Heading>
              <BodyLong spacing>
                Med «arbeid» mener vi aktivitet som kan gi eller som normalt ville ha vært betalt,
                som for eksempel:
              </BodyLong>
              <List as="ul">
                <List.Item>arbeid i arbeidsforholdarbeid</List.Item>
                <List.Item>arbeid i eget foretak</List.Item>
                <List.Item>gratisarbeid (for andre) når arbeidet vanligvis er betalt</List.Item>
                <List.Item>
                  timer du får betalt for, også når du ikke jobber alle timene (for eksempel ved
                  akkordarbeid)
                </List.Item>
                <List.Item>provisjonssalg, telefonsalg og liknende</List.Item>
                <List.Item>frilansarbeid</List.Item>
                <List.Item>lønnede verv</List.Item>
                <List.Item>hobbypreget arbeid, «homeparties» og liknende</List.Item>
                <List.Item>omsorgsstønad</List.Item>
              </List>
              <Heading size="small" level="3">
                Fosterforeldre
              </Heading>
              <BodyLong spacing>
                Du skal ikke føre opp timer som fosterforeldre på meldekortet.
              </BodyLong>
              <Heading size="small" level="3">
                Etablere egen virksomhet
              </Heading>
              <BodyLong spacing>
                Har du fått vedtak om at du kan beholde dagpenger under etablering?
              </BodyLong>
              <List as="ul">
                <List.Item>Du skal ikke føre timene du jobber i virksomheten.</List.Item>
              </List>
              <BodyLong spacing>Har du ikke fått vedtak fra NAV?</BodyLong>
              <List as="ul">
                <List.Item>
                  Du skal føre alle timene du jobber i virksomheten, selv om du ikke tar ut lønn og
                  det går med underskudd.
                </List.Item>
              </List>
              <Heading size="small" level="3">
                Formue og skattefri inntekt
              </Heading>
              <BodyLong spacing>
                Du skal ikke føre opp rene inntekter fra formue, det samme gjelder enkelte
                skattefrie inntekter utenfor virksomhet. Eksempler er:
              </BodyLong>
              <List as="ul">
                <List.Item>utleie av fast eiendom</List.Item>
                <List.Item>
                  renter, aksjeutbytte og annen avkastning av penger og verdipapir
                </List.Item>
                <List.Item>erskattefri oppussing av egen bolig/fritidsbolig</List.Item>
              </List>
              <Heading size="small" level="3">
                Ulønnet arbeid
              </Heading>
              <BodyLong spacing>
                Du skal ikke føre opp enkelte former for ulønnet arbeid på meldekortet. Eksempler
                er:
              </BodyLong>
              <List as="ul">
                <List.Item>
                  ulønnet arbeid, sosiale tjenester og besøkstjenester for funksjonshemmede og eldre
                </List.Item>
                <List.Item>
                  arbeid for humanitære organisasjoner, religiøse organisasjoner, idrettslag og
                  liknende, for arbeid som normalt utføres av medlemmer og frivillige uten
                  godtgjørelse
                </List.Item>
              </List>
              <Heading size="small" level="3">
                Naturalytelser
              </Heading>
              <BodyLong spacing>
                Naturalytelser er goder som du mottar fra arbeidsgiveren din, som for eksempel
                telefon eller bil.
              </BodyLong>
              <List as="ul">
                <List.Item>
                  For permitterte: Hvis du har hatt goder i mindre enn tre måneder før du ble
                  permittert, regnes summen av disse godene som timelønn. Antall timer som godene
                  utgjør skal føres som timer med arbeid på meldekortene.
                </List.Item>
              </List>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>Hva må jeg rapportere av tiltak, kurs og utdanning?</Accordion.Header>
            <Accordion.Content>
              <Heading size="small" level="3">
                Aktivitet/kurs/utdanning
              </Heading>
              <BodyLong spacing>
                Hvis du har avtalt med NAV å delta på tiltak, kurs, utdanning eller annen aktivitet,
                skal du svare «ja» og krysse av for de dagene du har utført avtalt aktivitet. Les
                mer om{" "}
                <Link href="https://www.nav.no/arbeid/utdanning">
                  dagpenger i kombinasjon med utdanning og opplæring
                </Link>
              </BodyLong>
              <BodyLong spacing>
                Hvis du deltar på kurs eller utdanning som ikke er avtalt, skal du svare «ja», og
                krysse av for de dagene du har deltatt. Dette gjelder også hvis du «leser» et fag på
                egenhånd.
              </BodyLong>
              <BodyLong spacing>
                Du skal bare melde fra om tiltak, kurs eller utdanning på meldekortet. Du skal ikke
                føre opp andre aktiviteter du har avtalt med NAV, slik som informasjonsmøter i regi
                av NAV og tid til å føre aktivitetsplan.
              </BodyLong>
              <BodyLong spacing>
                Hvis du ikke har utført en avtalt aktivitet, svarer du «nei». Hvis du ikke har
                avtalt aktivitet med NAV, og heller ikke har deltatt på kurs/utdanning, svarer du
                «nei».
              </BodyLong>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>Hva gjelder for sykdom?</Accordion.Header>
            <Accordion.Content>
              <Heading size="small" level="3">
                Sykdomsfravær
              </Heading>
              <BodyLong spacing>
                Hvis du på grunn av egen sykdom ikke har vært i stand til å jobbe eller delta på
                tiltak, kurs, utdanning eller jobbintervju, skal du svare «ja». Du skal da krysse av
                for de dagene du ikke har jobbet eller utført avtalt aktivitet.
              </BodyLong>
              <BodyLong spacing>
                Hvis du ikke har hatt fravær på grunn av sykdom, svarer du «nei».
              </BodyLong>
              <BodyLong spacing>
                Hvis du deltar på tiltak må du i tillegg melde fra til den som er ansvarlig for
                tiltaket.
              </BodyLong>
              <BodyLong spacing>
                Du har ikke rett til dagpenger når du er syk, men du kan ha rett til sykepenger. Du
                har ikke egenmeldingsdager når du mottar dagpenger, og må derfor be om sykmelding
                fra første dag du er syk.{" "}
                <Link href="https://www.nav.no/sykmeldt-og-permitert">
                  Jeg er arbeidsledig eller permittert og blir sykmeldt.
                </Link>
              </BodyLong>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>Hvis jeg tar ferie eller har annet fravær?</Accordion.Header>
            <Accordion.Content>
              <Heading size="small" level="3">
                Ferie og annet fravær
              </Heading>
              <BodyLong spacing>
                Du kan som hovedregel oppholde deg hvor du vil i Norge når du mottar dagpenger, uten
                å føre fravær på meldekortet. Er du ikke tilgjengelig for jobb eller tiltak på grunn
                av ferie eller annet fravær, må du føre disse dagene som fravær på meldekortet.
                Gjelder fraværet sykdom skal du svare på dette i spørsmål 3.
              </BodyLong>
              <BodyLong spacing>Deltar du på tiltak må du melde fra til tiltaksarrangør.</BodyLong>
              <BodyLong spacing>
                Hvis du har fravær vil du få trekk i utbetalingen din. Har du opparbeidet deg rett
                til
                <Link href="https://www.nav.no/feriepenger#dagpenger">dagpenger under ferie</Link>.
              </BodyLong>
              <BodyLong spacing>
                Skal du reise bort over lengre tid, må du kontakte NAV. NAV vil da vurdere om du
                fortsatt har rett til dagpenger i fraværsperioden.
              </BodyLong>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
        <div className="navigasjon-container">
          <RemixLink as="Button" to="" onClick={tilbake} variant="primary">
            Tilbake
          </RemixLink>
        </div>
      </div>
    </>
  );
}

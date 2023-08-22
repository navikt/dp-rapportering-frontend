import { Accordion, BodyLong, Heading } from "@navikt/ds-react";

export default function Info() {
  return (
    <>
      <main className="rapportering-kontainer">
        <Heading size={"medium"} level={"2"}>
          Hva skal jeg rapportere til NAV?
        </Heading>
        <BodyLong spacing>
          Her kan du lese om hva du skal rapportere til NAV når du mottar dagpenger. Det er lurt å
          gjøre seg godt kjent med hvordan rapporteringen fungerer.
        </BodyLong>
        <Accordion>
          <Accordion.Item>
            <Accordion.Header>Hva må jeg rapportere som arbeid?</Accordion.Header>
            <Accordion.Content>LEGG INN INNHOLD</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>Hva må jeg rapportere av tiltak, kurs og utdanning?</Accordion.Header>
            <Accordion.Content>LEGG INN INNHOLD</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>Hva gjelder for sykdom?</Accordion.Header>
            <Accordion.Content>LEGG INN INNHOLD</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>Hvis jeg tar ferie eller har annet fravær?</Accordion.Header>
            <Accordion.Content>LEGG INN INNHOLD</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </main>
    </>
  );
}

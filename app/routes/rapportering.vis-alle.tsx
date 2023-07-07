import { Heading } from "@navikt/ds-react";
import PeriodelistVisning from "~/components/periodeliste-visning/PeriodelisteVisning";

export default function VisAlle() {
  return (
    <>
      <Heading level="2" size="large" spacing>
        VIS ALLE PERIODER
      </Heading>

      <PeriodelistVisning />
    </>
  );
}

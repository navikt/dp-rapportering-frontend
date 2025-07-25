import { useAnalytics } from "~/hooks/useAnalytics";
import { useSanity } from "~/hooks/useSanity";

import { ReactLink } from "../ReactLink";

interface IProps {
  id: string;
  status: string;
}

export function EndringsLenke(props: IProps) {
  const { getAppText } = useSanity();

  const { trackSkjemaStartet, trackNavigere } = useAnalytics();

  const sti = "endre";
  const linkId = "rapportering-redigeringslenke-endre";
  const tekst = getAppText(linkId);

  const endringHandler = () => {
    trackNavigere({ lenketekst: tekst, destinasjon: `/periode/[periodeId]/${sti}`, linkId }); // Potensielt overflødig
    trackSkjemaStartet(props.id, true);
  };

  return (
    <ReactLink onClick={endringHandler} as="Link" to={`/periode/${props.id}/${sti}`}>
      {tekst}
    </ReactLink>
  );
}

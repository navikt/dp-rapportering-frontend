import { InformationSquareIcon } from "@navikt/aksel-icons";
import { BodyLong, Heading } from "@navikt/ds-react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { type AktivitetType, sletteAktivitet } from "~/models/aktivitet.server";
import { validerOgLagreAktivitet } from "~/utils/aktivitet.action.server";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetModal } from "~/components/aktivitet-modal/AktivitetModal";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const periodeId = params.rapporteringsperiodeId;
  const formdata = await request.formData();
  const aktivitetId = formdata.get("aktivitetId") as string;
  const submitKnapp = formdata.get("submit");

  switch (submitKnapp) {
    case "slette": {
      return await sletteAktivitet(request, periodeId, aktivitetId);
    }

    case "lagre": {
      return await validerOgLagreAktivitet(request, periodeId, formdata);
    }

    default: {
      return {
        status: "error",
        error: {
          statusCode: 500,
          statusText: "Noe gikk gal!",
        },
      };
    }
  }
}

export default function KorrigeringFyllUtSide() {
  const { periode } = useTypedRouteLoaderData("routes/korriger.$rapporteringsperiodeId");
  const actionData = useActionData<typeof action>();
  const { getLink, getAppText } = useSanity();

  const [valgtDato, setValgtDato] = useState<string | undefined>(undefined);
  const [valgteAktiviteter, setValgteAktiviteter] = useState<AktivitetType[]>([]);
  const [modalAapen, setModalAapen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (actionData?.status === "success") {
      lukkModal();
    }
  }, [actionData]);

  function aapneModal(dato: string) {
    setSearchParams({ utfylling: "true" });

    if (periode.status === "TilUtfylling") {
      setValgtDato(dato);
      setModalAapen(true);
      setSearchParams({ dato });
    }
  }

  function lukkModal() {
    setValgteAktiviteter([]);
    setValgtDato(undefined);
    setModalAapen(false);
  }

  return (
    <>
      <div className="rapportering-container">
        <Heading size={"medium"} level={"2"} tabIndex={-1} className="vo-fokus">
          {getAppText("rapportering-korriger-fyll-ut-tittel")}
        </Heading>
        <BodyLong spacing>{getAppText("rapportering-korriger-fyll-ut-beskrivelse")}</BodyLong>
        <Kalender rapporteringsperiode={periode} aapneModal={aapneModal} />
        <AktivitetModal
          rapporteringsperiode={periode}
          valgtDato={valgtDato}
          valgteAktiviteter={valgteAktiviteter}
          setValgteAktiviteter={setValgteAktiviteter}
          modalAapen={modalAapen}
          lukkModal={lukkModal}
        />
        <div className="registert-meldeperiode-container">
          <AktivitetOppsummering rapporteringsperiode={periode} />
        </div>
        <div className="navigasjon-container">
          <RemixLink
            as="Button"
            to={getLink("rapportering-korriger-fyll-ut-avbryt").linkUrl}
            variant={"secondary"}
          >
            {getLink("rapportering-korriger-fyll-ut-avbryt").linkText}
          </RemixLink>
          <RemixLink as="Button" to={`/korriger/${periode.id}/send-inn`}>
            {getLink("rapportering-korriger-fyll-ut-send-inn").linkText}
          </RemixLink>
        </div>
        <div className="hva-skal-jeg-rapportere-nav-link">
          <RemixLink
            as="Link"
            to={getLink("rapportering-fyll-ut-info").linkUrl}
            iconPosition="left"
            icon={<InformationSquareIcon title="a11y-title" fontSize={24} aria-hidden />}
          >
            {getLink("rapportering-fyll-ut-info").linkText}
          </RemixLink>
        </div>
      </div>
    </>
  );
}

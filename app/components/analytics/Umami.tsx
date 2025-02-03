import { awaitDecoratorData, getCurrentConsent } from "@navikt/nav-dekoratoren-moduler";
import { useEffect, useState } from "react";

import { getEnv } from "~/utils/env.utils";

interface Consent {
  analytics: boolean;
  surveys: boolean;
}

async function getConsent(callback: (consent: Consent) => void) {
  await awaitDecoratorData();
  const { consent } = getCurrentConsent();
  callback(consent);
}

export function Umami(): JSX.Element {
  const umamiId = getEnv("UMAMI_ID");
  const [userConsent, setUserConsent] = useState<Consent>({ analytics: false, surveys: false });

  useEffect(() => {
    getConsent(setUserConsent);
  }, []);

  return (
    <>
      {umamiId && (
        <script
          defer
          src="https://cdn.nav.no/team-researchops/sporing/sporing-uten-uuid.js"
          data-host-url="https://umami.nav.no"
          data-website-id={umamiId}
          data-auto-track={userConsent.analytics}
        ></script>
      )}
    </>
  );
}

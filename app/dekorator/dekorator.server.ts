import {
  DecoratorElements,
  DecoratorEnvProps,
  type DecoratorFetchProps,
  fetchDecoratorHtml,
} from "@navikt/nav-dekoratoren-moduler/ssr";
import { getEnv } from "~/utils/env.utils";

export async function getDecoratorHTML(): Promise<DecoratorElements> {
  const config: DecoratorFetchProps = {
    env: (getEnv("DEKORATOR_ENV") || "localhost") as DecoratorEnvProps["env"],
    localUrl: "https://dekoratoren.ekstern.dev.nav.no",
    params: {
      language: "nb",
      context: "privatperson",
      chatbot: false,
      enforceLogin: false,
      redirectToApp: true,
      level: "Level4",
      breadcrumbs: [
        { title: "Min side", url: "https://www.nav.no/minside" },
        {
          title: "Meldekort",
          url: "https://www.nav.no/arbeid/dagpenger/meldekort",
        },
      ],
    },
  };

  return await fetchDecoratorHtml(config);
}

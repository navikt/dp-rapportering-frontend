import {
  DecoratorElements,
  DecoratorEnvProps,
  type DecoratorFetchProps,
  type DecoratorParams,
  fetchDecoratorHtml,
} from "@navikt/nav-dekoratoren-moduler/ssr";
import { getEnv } from "~/utils/env.utils";

export async function getDecoratorHTML(params: DecoratorParams): Promise<DecoratorElements> {
  const config: DecoratorFetchProps = {
    env: (getEnv("DEKORATOR_ENV") || "localhost") as DecoratorEnvProps["env"],
    localUrl: "https://dekoratoren.ekstern.dev.nav.no",
    params: {
      language: "nb",
      context: "privatperson",
      chatbot: false,
      redirectToApp: true,
      level: "Level4",
      breadcrumbs: [],
      ...params,
    },
  };

  return await fetchDecoratorHtml(config);
}

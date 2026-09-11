import navStyles from "@navikt/ds-css?url";
import { Heading, InlineMessage } from "@navikt/ds-react";
import { onLanguageSelect, setAvailableLanguages } from "@navikt/nav-dekoratoren-moduler";
import parse from "html-react-parser";
import { useEffect, useRef } from "react";
import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { data, redirect } from "react-router";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  useRouteLoaderData,
} from "react-router";
import { uuidv7 } from "uuidv7";

import indexStyle from "~/index.css?url";

import { hasSession } from "../mocks/session";
import { GeneralErrorBoundary } from "./components/error-boundary/GeneralErrorBoundary";
import { ServiceMessage } from "./components/service-message/ServiceMessage";
import { getDecoratorHTML } from "./dekorator/dekorator.server";
import { DevTools } from "./devTools";
import { useAnalytics } from "./hooks/useAnalytics";
import { useInjectDecoratorScript } from "./hooks/useInjectDecoratorScript";
import { getAppText, getMessages, useSanity } from "./hooks/useSanity";
import { getLanguage, setLanguage } from "./models/language.server";
import { hentSanityTekster } from "./sanity/sanity.server";
import styles from "./styles/root.module.css";
import { availableLanguages, DecoratorLocale, getLocale } from "./utils/dekoratoren.utils";
import { getEnv, isLocalOrDemo } from "./utils/env.utils";
import { initInstrumentation } from "./utils/faro";
import { FEATURE_TOGGLES, isFeatureEnabled } from "./utils/unleash.server";

export const meta: MetaFunction = () => {
  return [
    {
      charset: "utf-8",
    },
    {
      name: "viewport",
      content: "width=device-width,initial-scale=1",
    },
    { title: "Meldekort - dagpenger" },
    {
      property: "og:title",
      content: "Meldekort - dagpenger",
    },
    {
      name: "description",
      content: "meldekortløsning for dagpenger",
    },
  ];
};

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: navStyles },
    { rel: "stylesheet", href: indexStyle },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: `${getEnv("BASE_PATH")}/favicon-32x32.png`,
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: `${getEnv("BASE_PATH")}/favicon-16x16.png`,
    },
    {
      rel: "icon",
      type: "image/x-icon",
      href: `${getEnv("BASE_PATH")}/favicon.ico`,
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const locale: DecoratorLocale = (await getLanguage(request)) as DecoratorLocale;
  const dekorator = await getDecoratorHTML({ language: locale ?? DecoratorLocale.NB });

  if (!dekorator) {
    throw new Response("rapportering-feilmelding-kunne-ikke-hente-dekoratoren", { status: 500 });
  }

  const language = getLocale(locale);
  const [sanityData, disableSpm5] = await Promise.all([
    hentSanityTekster(language),
    isFeatureEnabled(FEATURE_TOGGLES.disableSpm5),
  ]);

  if (isLocalOrDemo && !hasSession(request)) {
    return redirect("/", {
      headers: {
        "Set-Cookie": `sessionId=${uuidv7()}; Path=/; SameSite=Lax`,
      },
    });
  }

  return {
    ...sanityData,
    disableSpm5,
    locale: language,
    env: {
      BASE_PATH: process.env.BASE_PATH,
      IS_LOCALHOST: process.env.IS_LOCALHOST,
      USE_MSW: process.env.USE_MSW,
      FARO_URL: process.env.FARO_URL,
      RUNTIME_ENVIRONMENT: process.env.RUNTIME_ENVIRONMENT,
      SANITY_DATASETT: process.env.SANITY_DATASETT,
      GITHUB_SHA: process.env.GITHUB_SHA,
    },
    dekorator,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const formData = await request.formData();

  const locale = formData.get("locale") as DecoratorLocale;

  return data(
    { status: "success" },
    {
      headers: {
        "Set-Cookie": await setLanguage(cookieHeader, locale),
      },
    },
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const rootData = useRouteLoaderData<typeof loader>("root");
  const serviceMessages = rootData ? getMessages(rootData.sanityTexts) : [];
  const mainContent = useRef<HTMLElement>(null);
  const dekorator = rootData?.dekorator;

  useInjectDecoratorScript(dekorator?.DECORATOR_SCRIPTS);

  useEffect(() => {
    if (typeof document !== "undefined" && mainContent.current) {
      mainContent.current.querySelectorAll("a").forEach((a) => {
        if (!a.getAttribute("data-umami-event")) {
          const dataUmamiEvent = a.pathname.includes(getEnv("BASE_PATH"))
            ? "intern-lenke"
            : "ekstern-lenke";

          a.setAttribute("data-umami-event", dataUmamiEvent);
          a.setAttribute("data-umami-event-url", a.href);
        }
      });
    }
  }, [children]);

  return (
    <html lang="nb">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {dekorator && parse(dekorator.DECORATOR_HEAD_ASSETS, { trim: true })}
        <Meta />
        <Links />
      </head>
      <body>
        {rootData && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.env = ${JSON.stringify(rootData.env)}`,
            }}
          />
        )}
        {dekorator && parse(dekorator.DECORATOR_HEADER, { trim: true })}

        {serviceMessages.length > 0 && (
          <div className={styles.serviceMessages}>
            {serviceMessages.map((message) => (
              <ServiceMessage key={message.textId} message={message} />
            ))}
          </div>
        )}

        <main ref={mainContent} id="maincontent" role="main" tabIndex={-1}>
          {children}
        </main>
        <ScrollRestoration />
        {dekorator && parse(dekorator.DECORATOR_FOOTER, { trim: true })}
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { getAppText } = useSanity();
  const rootData = useRouteLoaderData<typeof loader>("root");
  const { trackSprakEndret, trackForetrukketSprak } = useAnalytics();

  initInstrumentation();

  useEffect(() => {
    setAvailableLanguages(availableLanguages);
    trackForetrukketSprak(navigator.language);

    if (typeof document !== "undefined") {
      onLanguageSelect((language) => {
        trackSprakEndret(language.locale as DecoratorLocale);
        document.documentElement.setAttribute("lang", language.locale);

        // Bruker vanlig fetch mot rot-dokumentet (ikke fetcher.submit) for å unngå React Routers .data-endepunkt
        const formData = new FormData();
        formData.set("locale", language.locale);
        fetch(`${getEnv("BASE_PATH")}/`, { method: "POST", body: formData }).then(() => {
          window.location.reload();
        });
      });
    }
  }, []);

  return (
    <>
      <div className={styles.rapporteringHeader}>
        <div className={styles.rapporteringHeaderInnhold}>
          <Heading tabIndex={-1} level="1" size="xlarge" className="vo-fokus">
            {rootData?.sanityTekst?.grunntekster?.sidetittel ?? getAppText("rapportering-tittel")}
          </Heading>
          {isLocalOrDemo && (
            <div className={styles.demoInfo}>
              <InlineMessage status="warning">
                Dette er en demoside og inneholder ikke dine personlige data.
              </InlineMessage>
              <DevTools />
            </div>
          )}
        </div>
      </div>
      <div className={styles.pageContainer}>
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </div>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  // Root loader kan mangle data her (f.eks. ved ikke-matchende rute), så vi kan ikke bruke useSanity/getAppText
  const rootData = useRouteLoaderData<typeof loader>("root");
  const tittel = rootData
    ? getAppText(rootData.sanityTexts, "rapportering-tittel")
    : "Meldekort for dagpenger";

  return (
    <main id="maincontent" role="main" tabIndex={-1}>
      <div className={styles.rapporteringHeader}>
        <div className={styles.rapporteringHeaderInnhold}>
          <Heading tabIndex={-1} level="1" size="xlarge" className="vo-fokus">
            {tittel}
          </Heading>
          {isLocalOrDemo && <DevTools />}
        </div>
      </div>
      <div className={styles.pageContainer}>
        <div className={styles.pageContent}>
          <GeneralErrorBoundary error={error} />
        </div>
      </div>
    </main>
  );
}

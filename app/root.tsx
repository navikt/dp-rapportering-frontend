import navStyles from "@navikt/ds-css/dist/index.css";
import { cssBundleHref } from "@remix-run/css-bundle";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { createClient } from "@sanity/client";
import parse from "html-react-parser";
import { RootErrorBoundaryView } from "./components/error-boundary/RootErrorBoundaryView";
import { hentDekoratorHtml } from "./dekorator/dekorator.server";
import { sanityConfig } from "./sanity/sanity.config";
import { allTextsQuery } from "./sanity/sanity.query";
import type { ISanityTexts } from "./sanity/sanity.types";
import { getEnv } from "./utils/env.utils";

import indexStyle from "~/index.css";
import globalStyle from "~/global.css";

export const sanityClient = createClient(sanityConfig);

export function meta() {
  return [
    {
      charset: "utf-8",
    },
    {
      name: "viewport",
      content: "width=device-width,initial-scale=1",
    },
    { title: "Dagpenger rapportering" },
    {
      property: "og:title",
      content: "Dagpenger rapportering",
    },
    {
      name: "description",
      content: "rapporteringløsning for dagpenger",
    },
  ];
}

export function links() {
  return [
    ...(cssBundleHref
      ? [
          { rel: "stylesheet", href: navStyles },
          { rel: "stylesheet", href: cssBundleHref },
          { rel: "stylesheet", href: indexStyle },
          { rel: "stylesheet", href: globalStyle },
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
        ]
      : []),
  ];
}

export async function loader() {
  const fragments = await hentDekoratorHtml();

  const sanityTexts = await sanityClient.fetch<ISanityTexts>(allTextsQuery, {
    baseLang: "nb",
    lang: "nb",
  });

  return json({
    sanityTexts,
    env: {
      BASE_PATH: process.env.BASE_PATH,
      DP_RAPPORTERING_URL: process.env.DP_RAPPORTERING_URL,
      IS_LOCALHOST: process.env.IS_LOCALHOST,
    },
    fragments,
  });
}

export default function App() {
  const { env, fragments } = useLoaderData<typeof loader>();
  return (
    <html lang="nb">
      <head>
        <Meta />
        {parse(fragments.DECORATOR_STYLES, { trim: true })}
        {/* Ikke legg parsing av dekoratør-html i egne komponenter. Det trigger rehydrering, 
            som gjør at grensesnittet flimrer og alle assets lastes på nytt siden de har så mange side effects. 
            Løsningen enn så lenge er å inline parsingen av HTML her i root. 
         */}
        <Links />
      </head>
      <body>
        {parse(fragments.DECORATOR_HEADER, { trim: true })}
        <Outlet />
        <ScrollRestoration />
        {parse(fragments.DECORATOR_FOOTER, { trim: true })}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(env)}`,
          }}
        />
        <Scripts />
        {parse(fragments.DECORATOR_SCRIPTS, { trim: true })}
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.log("treffer root errorboundary", error);
  return <RootErrorBoundaryView links={<Links />} meta={<Meta />} error={error} />;
}

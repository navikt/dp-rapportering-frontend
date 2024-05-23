/* eslint-disable */
import { hentDekoratorHtml } from "./dekorator/dekorator.server";
import { allTextsQuery } from "./sanity/sanity.query";
import type { ISanity } from "./sanity/sanity.types";
import favicon16 from "/favicon-16x16.png";
import favicon32 from "/favicon-32x32.png";
import favicon from "/favicon.ico";
import { Skeleton } from "@navikt/ds-react";
import { json } from "@remix-run/node";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from "@remix-run/react";
import { createClient } from "@sanity/client";
import parse from "html-react-parser";
import { Fragment, Suspense } from "react";
import { sanityConfig } from "./sanity/sanity.config";
import { initInstrumentation } from "~/utils/faro";
import { useTypedRouteLoaderData } from "./hooks/useTypedRouteLoaderData";
import { RootErrorBoundaryView } from "./components/error-boundary/RootErrorBoundaryView";

/* eslint-enable */
import navStyles from "@navikt/ds-css/dist/index.css?url";
import indexStyle from "~/index.css?url";

export const sanityClient = createClient(sanityConfig);

export const meta: MetaFunction = () => {
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
};

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: navStyles },
    { rel: "stylesheet", href: indexStyle },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: favicon32,
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: favicon16,
    },
    {
      rel: "icon",
      type: "image/x-icon",
      href: favicon,
    },
  ];
};

export async function loader() {
  const fragments = await hentDekoratorHtml();

  const sanityTexts = await sanityClient.fetch<ISanity>(allTextsQuery, {
    baseLang: "nb",
    lang: "nb",
  });

  return json({
    sanityTexts,
    env: {
      BASE_PATH: process.env.BASE_PATH,
      IS_LOCALHOST: process.env.IS_LOCALHOST,
      USE_MSW: process.env.USE_MSW,
      FARO_URL: process.env.FARO_URL,
    },
    fragments,
  });
}

initInstrumentation();

export function Layout({ children }: { children: React.ReactNode }) {
  const { fragments, env } = useTypedRouteLoaderData("root");

  return (
    <html lang="nb">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Suspense fallback={<Fragment />}>{parse(fragments?.DECORATOR_STYLES)}</Suspense>
        <Meta />
        <Links />
      </head>
      <body>
        <Suspense fallback={<Skeleton variant="text" width="100%" height={300} />}>
          {parse(fragments?.DECORATOR_HEADER)}
        </Suspense>
        {children}
        <ScrollRestoration />
        <Suspense fallback={<Skeleton variant="text" width="100%" height={300} />}>
          {parse(fragments?.DECORATOR_FOOTER)}
        </Suspense>
        <Scripts />
        <Suspense fallback={<Fragment />}>{parse(fragments?.DECORATOR_SCRIPTS)}</Suspense>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(env)}`,
          }}
        />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  return <RootErrorBoundaryView links={<Links />} meta={<Meta />} error={error} />;
}

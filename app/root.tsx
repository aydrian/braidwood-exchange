import { ClerkApp, ClerkErrorBoundary } from "@clerk/remix";
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import {
  type LinksFunction,
  type LoaderFunction,
  type MetaFunction,
  json
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";

import { ClientHints } from "~/components/client-hints";
import iconHref from "~/components/icons/sprite.svg";
import { getHints } from "~/hooks/use-hints";

import "./tailwind.css";
import { getDomainUrl } from "./utils/misc.server";

export const loader: LoaderFunction = (args) => {
  return rootAuthLoader(args, ({ request }) => {
    return json({
      requestInfo: {
        hints: getHints(request),
        origin: getDomainUrl(request),
        path: new URL(request.url).pathname
      }
    } as const);
  });
};

export const meta: MetaFunction = () => [
  { charset: "utf-8" },
  { title: "Braidwood Corgis Secret Santa Paws" },
  { viewport: "width=device-width, initial-scale=1" }
];

export const links: LinksFunction = () => {
  return [
    { as: "image", href: iconHref, rel: "preload", type: "image/svg+xml" },
    { as: "style", href: "/fonts/moc/font.css", rel: "preload" },
    { href: "/fonts/moc/font.css", rel: "stylesheet" }
  ];
};

export const ErrorBoundary = ClerkErrorBoundary();

function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <ClientHints />
        <Meta />
        <Links />
      </head>
      <body
        className="bg-red-500"
        style={{
          backgroundImage:
            "linear-gradient(45deg, white 25%, transparent 25.5%, transparent 50%, white 50.5%, white 75%, transparent 75.5%, transparent)",
          backgroundSize: "80px 80px"
        }}
      >
        <Outlet />
        <ScrollRestoration />
        <LiveReload />
        <Scripts />
      </body>
    </html>
  );
}

export default ClerkApp(App);

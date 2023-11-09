import type { LinksFunction, LoaderFunction } from "@remix-run/node";

import { ClerkApp, ClerkErrorBoundary } from "@clerk/remix";
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";

import iconHref from "~/components/icons/sprite.svg";

import "./tailwind.css";

export const loader: LoaderFunction = (args) => rootAuthLoader(args);

export const links: LinksFunction = () => {
  return [
    { as: "image", href: iconHref, rel: "preload", type: "image/svg+xml" }
  ];
};

export const ErrorBoundary = ClerkErrorBoundary();

function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <LiveReload />
        <Scripts />
      </body>
    </html>
  );
}

export default ClerkApp(App);

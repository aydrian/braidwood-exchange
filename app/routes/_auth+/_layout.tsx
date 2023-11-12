import { Outlet } from "@remix-run/react";

import { Icon } from "~/components/icon";
import corgiSanta from "~/images/santa-corgi.png";

export default function AuthLayout() {
  return (
    <main className="flex min-h-screen flex-col md:flex-row md:justify-evenly">
      <div className="flex basis-1/4 flex-col items-center justify-center gap-2 bg-white p-2 md:basis-1/2">
        <img alt="Corgi Santa" className="h-auto w-1/2" src={corgiSanta} />
        <h1 className="font-mountains-of-christmas w-3/4 text-center text-2xl font-semibold leading-tight md:text-4xl">
          Braidwood Corgis Secret Santa Paws
        </h1>
      </div>
      <div className="flex basis-3/4 items-start justify-center p-2 md:basis-1/2 md:items-center md:pt-0">
        <Outlet />
      </div>
      <a
        className="absolute bottom-4 left-4 text-xs hover:text-red-500 hover:underline"
        href="https://www.flaticon.com/free-icons/corgi"
        title="corgi icons"
      >
        Corgi icons created by Iconriver - Flaticon
      </a>
      <a
        className="absolute bottom-4 right-4"
        href="https://github.com/aydrian/braidwood-exchange"
        rel="noreferrer"
        target="_blank"
      >
        <Icon className="h-8 w-8" name="github" />
        <span className="sr-only">Braidwood Exchange GitHub Repository</span>
      </a>
    </main>
  );
}

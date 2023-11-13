import { UserButton } from "@clerk/remix";
import { Outlet } from "@remix-run/react";

import { Icon } from "~/components/icon";
import corgiSanta from "~/images/santa-corgi.png";

export default function Layout() {
  return (
    <div className="container flex min-h-screen w-full flex-col gap-4 p-4 md:px-16">
      <header className="flex flex-col items-center justify-between overflow-hidden rounded-md bg-white px-6 py-2 shadow-md md:flex-row-reverse">
        <div className="flex w-full justify-end md:w-auto">
          <UserButton />
        </div>
        <div className="flex flex-col items-center gap-2 md:w-full md:flex-row md:gap-0">
          <img alt="Corgi Santa" className="-mb-3 h-20" src={corgiSanta} />
          <h1 className="text-center font-mountains-of-christmas text-4xl font-semibold md:text-left">
            Braidwood Corgis Secret Santa Paws
          </h1>
        </div>
      </header>
      <main className="grow">
        <Outlet />
      </main>
      <footer className="flex justify-between rounded-md bg-white p-2 shadow-md">
        <div></div>
        <div className="flex flex-col items-end gap-1">
          <a
            href="https://github.com/aydrian/braidwood-exchange"
            rel="noreferrer"
            target="_blank"
          >
            <Icon className="h-6 w-6" name="github" />
            <span className="sr-only">
              Braidwood Exchange GitHub Repository
            </span>
          </a>
          <a
            className="text-xs hover:text-red-500 hover:underline"
            href="https://www.flaticon.com/free-icons/corgi"
            title="corgi icons"
          >
            Corgi icons created by Iconriver - Flaticon
          </a>
        </div>
      </footer>
    </div>
  );
}

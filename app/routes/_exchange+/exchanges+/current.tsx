import { getAuth } from "@clerk/remix/ssr.server";
import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { Button } from "~/components/ui/button";
import { getHints } from "~/hooks/use-hints";
import giftCorgi from "~/images/gift-corgi.png";
import { prisma } from "~/utils/db.server";

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }

  const timeZone = getHints(args.request).timeZone;

  const corgiIds = await prisma.corgi
    .findMany({
      select: { id: true },
      where: { ownerId: userId }
    })
    .then((corgis) => corgis.map(({ id }) => id));

  const exchanges = await prisma.exchange.findMany({
    select: { dueDate: true, id: true, title: true, year: true },
    where: { entries: { none: { santaId: { in: corgiIds } } }, isOpen: true }
  });
  return json({ exchanges, timeZone });
}

export default function ExchangesCurrent() {
  const { exchanges, timeZone } = useLoaderData<typeof loader>();
  console.log({ timeZone });
  return (
    <>
      <div className="flex flex-col gap-4 rounded-md bg-white p-6 shadow-md">
        <h2 className="text-3xl font-semibold">Current Gift Exchanges</h2>

        <ul className="flex flex-wrap gap-4">
          {exchanges.map((exchange) => (
            <li className="flex flex-col items-center gap-2" key={exchange.id}>
              <div
                className="h-36 w-36 rounded border border-gray-300 bg-red-500 p-2 shadow"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, white 25%, transparent 25.5%, transparent 50%, white 50.5%, white 75%, transparent 75.5%, transparent)",
                  backgroundSize: "80px 80px"
                }}
              >
                <img
                  alt="gift corgi"
                  className="rounded border border-gray-300 bg-white"
                  src={giftCorgi}
                />
              </div>
              <div>
                <h4 className="text-center font-mountains-of-christmas text-2xl">
                  {exchange.title} {exchange.year}
                </h4>
                <p className="text-center text-sm">
                  <span className="font-medium">Join before: </span>
                  {new Date(exchange.dueDate).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    timeZone
                  })}
                </p>
              </div>
              <Button asChild>
                <Link to={`/exchanges/${exchange.id}/join`}>Join</Link>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

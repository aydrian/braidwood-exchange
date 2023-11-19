import { getAuth } from "@clerk/remix/ssr.server";
import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { prisma } from "~/utils/db.server";

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }
  const { exchangeId } = args.params;
  const exchange = await prisma.exchange.findUnique({
    select: { id: true, title: true, year: true },
    where: { id: exchangeId }
  });
  if (!exchange) {
    throw new Response(null, { status: 404, statusText: "Not found" });
  }
  const corgis = await prisma.corgi.findMany({
    select: { id: true },
    where: { ownerId: userId }
  });

  return json({ corgis, exchange });
}

export default function ExchangeIdJoin() {
  const { corgis, exchange } = useLoaderData<typeof loader>();
  console.log({ corgis, exchange });
  return (
    <>
      <div className="flex flex-col gap-4 rounded-md bg-white p-6 shadow-md">
        <h2 className="text-3xl font-semibold">
          Join {exchange.title} {exchange.year}
        </h2>
        <p className="text-sm font-thin text-gray-800">
          To join this gift exchange, please fill out the information below for
          each corgi participating. After the form closes your assigned
          recipients along with their information will appear on your dashboard.
          Please send a gift valued at least $10. Toys only please, no food or
          treats! Amazon and Chewy are great options.
        </p>
      </div>
    </>
  );
}

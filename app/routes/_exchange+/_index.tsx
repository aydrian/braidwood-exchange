import { getAuth } from "@clerk/remix/ssr.server";
import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import giftCorgi from "~/images/gift-corgi.png";
import { prisma } from "~/utils/db.server";

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }
  const [mailingAddress, corgis] = await Promise.all([
    prisma.mailingAddress.findUnique({
      where: { userId }
    }),
    prisma.corgi.findMany({ where: { ownerId: userId } })
  ]);

  const corgiIds = corgis.map((corgi) => corgi.id);
  const entries = await prisma.entry.findMany({
    select: {
      exchange: true,
      notes: true,
      recipient: true,
      santa: true
    },
    where: { santaId: { in: corgiIds } }
  });

  if (!mailingAddress || corgis.length < 1) {
    return redirect("/onboarding");
  }

  return { corgis, entries, mailingAddress };
}

export default function Index() {
  const { corgis, entries, mailingAddress } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="flex flex-col gap-4 rounded-md bg-white p-6 shadow-md">
        <div className="flex justify-between">
          <h2 className="text-3xl font-semibold">Your Profile</h2>
          <Button asChild>
            <Link to="/onboarding">Edit</Link>
          </Button>
        </div>
        <div className="flex flex-col justify-evenly gap-4 md:flex-row">
          <Card className="grow">
            <CardHeader>
              <CardTitle>Mailing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                {mailingAddress.address1}
                <br />
                {mailingAddress.address2}
                <br />
                {mailingAddress.city}, {mailingAddress.state}{" "}
                {mailingAddress.zip}
                <br />
                {mailingAddress.phone}
              </p>
            </CardContent>
          </Card>
          <Card className="grow">
            <CardHeader>
              <CardTitle>
                Your {corgis.length > 1 ? "Corgis" : "Corgi"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-wrap gap-4">
                {corgis.map((corgi) => (
                  <li key={corgi.id}>
                    <div
                      className="h-36 w-36 rounded border border-gray-300 bg-red-500 p-2 shadow"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, white 25%, transparent 25.5%, transparent 50%, white 50.5%, white 75%, transparent 75.5%, transparent)",
                        backgroundSize: "80px 80px"
                      }}
                    >
                      <img
                        alt={corgi.name}
                        className="rounded border border-gray-300"
                        src={corgi.imageUri}
                      />
                    </div>
                    <h4 className="text-center font-mountains-of-christmas text-2xl">
                      {corgi.name}
                    </h4>
                    <p className="text-center text-sm">
                      <span className="font-medium">Birthdate: </span>
                      {format(new Date(corgi.birthDate), "MM/dd/yyyy")}
                      <br />
                      <span className="text-xs">
                        ({corgi.age?.years} years {corgi.age?.months} months)
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-4 rounded-md bg-white p-6 shadow-md">
        <h2 className="text-3xl font-semibold">Gift Exchange</h2>
        {entries.length > 0 ? (
          <div>TODO</div>
        ) : (
          <div className="mx-auto flex flex-col items-center justify-center">
            <img alt="corgi with gift" className="h-36 w-36" src={giftCorgi} />
            <h3 className="text-center">
              You're not currently participateing in any gift exchanges.
            </h3>
          </div>
        )}
      </div>
    </>
  );
}

import { getAuth } from "@clerk/remix/ssr.server";
import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import giftCorgi from "~/images/gift-corgi.png";
import { prisma } from "~/utils/db.server";

import { useProfileData } from "./_layout";

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }
  await prisma.user
    .findUniqueOrThrow({
      select: { id: true },
      where: { id: userId }
    })
    .catch(() => redirect("/onboarding"));

  const corgiIds = await prisma.corgi
    .findMany({
      select: { id: true },
      where: { ownerId: userId }
    })
    .then((corgis) => corgis.map(({ id }) => id));

  const entries = await prisma.entry.findMany({
    select: {
      exchange: true,
      notes: true,
      recipient: true,
      santa: true
    },
    where: { santaId: { in: corgiIds } }
  });

  return json({ entries });
}

export default function Index() {
  const { entries } = useLoaderData<typeof loader>();
  const { corgis, mailingAddress } = useProfileData();
  return (
    <>
      <div className="flex flex-col gap-4 rounded-md bg-white p-6 shadow-md">
        <div className="flex justify-between">
          <h2 className="text-3xl font-semibold">Your Profile</h2>
          <Button asChild>
            <Link to="/profile/edit">Edit</Link>
          </Button>
        </div>
        <div className="flex flex-col justify-evenly gap-4 md:flex-row">
          <Card className="grow">
            <CardHeader>
              <CardTitle>Mailing Address</CardTitle>
            </CardHeader>
            <CardContent>
              {mailingAddress ? (
                <p>
                  {mailingAddress.address1}
                  <br />
                  {mailingAddress.address2 ? (
                    <>
                      {mailingAddress.address2}
                      <br />
                    </>
                  ) : null}
                  {mailingAddress.city}, {mailingAddress.state}{" "}
                  {mailingAddress.zip}
                  <br />
                  {mailingAddress.phone}
                </p>
              ) : null}
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
                      {new Date(corgi.birthDate).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "2-digit",
                        timeZone: "UTC",
                        year: "numeric"
                      })}
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
        <div className="flex justify-between">
          <h2 className="text-3xl font-semibold">Gift Exchange</h2>
          {/* <Button asChild>
            <Link to="/exchanges/current">Join</Link>
          </Button> */}
        </div>
        {entries.length > 0 ? (
          <div>TODO</div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1">
            <img alt="corgi with gift" className="h-36 w-36" src={giftCorgi} />
            <h3 className="text-center">
              You're not currently participateing in any gift exchanges.
            </h3>
            {/* <Button asChild>
              <Link to="/exchanges/current">Join a Gift Exchange</Link>
            </Button> */}
          </div>
        )}
      </div>
    </>
  );
}

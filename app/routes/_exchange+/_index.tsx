import { getAuth } from "@clerk/remix/ssr.server";
import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

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

  if (!mailingAddress || corgis.length < 1) {
    return redirect("/onboarding");
  }

  return { corgis, mailingAddress };
}

export default function Index() {
  const { corgis, mailingAddress } = useLoaderData<typeof loader>();
  return (
    <div className="rounded-md bg-white p-6 shadow-md">
      <p>You are signed in!</p>
    </div>
  );
}

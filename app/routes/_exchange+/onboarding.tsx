import { useUser } from "@clerk/remix";
import { getAuth } from "@clerk/remix/ssr.server";
import { type DataFunctionArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import ProfileEditor from "~/routes/resources+/profile-editor";
import { prisma } from "~/utils/db.server";

export async function loader(args: DataFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }
  const exchange = await prisma.exchange.findFirst({
    select: { id: true },
    where: {
      title: { contains: "Braidwood" },
      year: new Date().getFullYear().toString()
    }
  });
  const redirectTo = exchange ? `/exchanges/${exchange.id}/join` : "/";
  return json({ redirectTo });
}

export default function Onboarding() {
  const { user } = useUser();
  const { redirectTo } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-4 rounded-md bg-white p-6 shadow-md">
      <div>
        <h2 className="text-2xl font-medium">Welcome {user?.firstName}</h2>
        <p className="text-sm text-gray-800">
          We'll need the following information to participate in the gift
          exchange.
        </p>
      </div>
      <ProfileEditor redirectTo={redirectTo} />
    </div>
  );
}

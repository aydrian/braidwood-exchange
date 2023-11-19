import { getAuth } from "@clerk/remix/ssr.server";
import { type DataFunctionArgs, redirect } from "@remix-run/node";

import ProfileEditor from "../resources+/profile-editor";

export async function loader(args: DataFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }
  return null;
}
export default function ProfileUpdate() {
  return (
    <div className="flex flex-col gap-4 rounded-md bg-white p-6 shadow-md">
      <div>
        <h2 className="text-3xl font-semibold">Update Profile</h2>
      </div>
      <ProfileEditor />
    </div>
  );
}

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { getAuth } from "@clerk/remix/ssr.server";
import {
  type FieldConfig,
  conform,
  useFieldList,
  useFieldset,
  useForm
} from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useRef } from "react";
import z from "zod";

import { SubmitButton, TextareaField } from "~/components/form";
import { prisma } from "~/utils/db.server";

const EntrySchema = z.object({
  corgiImageUri: z.string().optional(),
  corgiName: z.string().optional(),
  exchangeId: z.string(),
  notes: z.string().optional(),
  santaId: z.string()
});

const EntriesSchema = z.object({ entries: z.array(EntrySchema) });

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
    select: { id: true, imageUri: true, name: true },
    where: { ownerId: userId }
  });

  return json({ corgis, exchange });
}

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }
  const { request } = args;
  const formData = await request.formData();
  const submission = parse(formData, {
    schema: EntriesSchema
  });
  if (!submission.value) {
    return json(
      {
        status: "error",
        submission
      } as const,
      { status: 400 }
    );
  }
  if (submission.intent !== "submit") {
    return json({ status: "idle", submission } as const);
  }

  const { entries } = submission.value;
  const entryCreates = entries.map(({ exchangeId, notes, santaId }) => {
    return prisma.entry.create({ data: { exchangeId, notes, santaId } });
  });

  await Promise.all(entryCreates);

  return redirect("/");
}

export default function ExchangeIdJoin() {
  const { corgis, exchange } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const defaultEntries = corgis.map((corgi) => ({
    corgiImageUri: corgi.imageUri,
    corgiName: corgi.name,
    exchangeId: exchange.id,
    santaId: corgi.id
  }));

  const [form, { entries }] = useForm({
    constraint: getFieldsetConstraint(EntriesSchema),
    defaultValue: { entries: defaultEntries },
    id: "entries-form",
    lastSubmission: fetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: EntriesSchema });
    },
    shouldRevalidate: "onBlur"
  });
  const entryList = useFieldList(form.ref, entries);

  return (
    <>
      <div className="flex flex-col gap-4 rounded-md bg-white p-6 shadow-md">
        <div>
          <h2 className="text-3xl font-semibold">
            Join {exchange.title} {exchange.year}
          </h2>
          <p className="text-sm font-thin text-gray-800">
            To join this gift exchange, please fill out the information below
            for each corgi participating. After the form closes your assigned
            recipients along with their information will appear on your
            dashboard. Please send a gift valued at least $10. Toys only please,
            no food or treats! Amazon and Chewy are great options.
          </p>
        </div>
        <fetcher.Form
          method="post"
          {...form.props}
          className="flex flex-col gap-2"
        >
          <ul className="flex flex-col flex-wrap gap-4 md:flex-row">
            {entryList.map((entry) => (
              <li key={entry.key}>
                <EntryFieldset {...entry} />
              </li>
            ))}
          </ul>
          <SubmitButton className="w-full sm:w-auto">Submit</SubmitButton>
        </fetcher.Form>
      </div>
    </>
  );
}

function EntryFieldset(config: FieldConfig<z.input<typeof EntrySchema>>) {
  const ref = useRef<HTMLFieldSetElement>(null);
  const { corgiImageUri, corgiName, exchangeId, notes, santaId } = useFieldset(
    ref,
    config
  );

  return (
    <fieldset
      className="flex max-w-fit flex-col items-center gap-2 md:flex-row"
      ref={ref}
    >
      <input {...conform.input(exchangeId, { type: "hidden" })} />
      <input {...conform.input(santaId, { type: "hidden" })} />
      <div
        className="h-48 w-48 rounded border border-gray-300 bg-red-500 p-2 shadow"
        style={{
          backgroundImage:
            "linear-gradient(45deg, white 25%, transparent 25.5%, transparent 50%, white 50.5%, white 75%, transparent 75.5%, transparent)",
          backgroundSize: "80px 80px"
        }}
      >
        <img
          alt={corgiName.defaultValue}
          className="rounded border border-gray-300"
          src={corgiImageUri.defaultValue}
        />
      </div>
      <div className="flex h-full flex-col items-center justify-between">
        <h4 className="text-center font-mountains-of-christmas text-2xl">
          {corgiName.defaultValue}
        </h4>
        <TextareaField
          className="grow"
          errors={notes.errors}
          labelProps={{ children: "Notes", htmlFor: notes.id }}
          textareaProps={{
            ...conform.textarea(notes),
            placeholder:
              "Any addtional information you'd like to include for your Secret Santa Paws",
            // @ts-ignore
            rows: "4"
          }}
        />
      </div>
    </fieldset>
  );
}

import type { DataFunctionArgs } from "@remix-run/node";

import { useUser } from "@clerk/remix";
import { getAuth } from "@clerk/remix/ssr.server";
import {
  type FieldConfig,
  conform,
  list,
  useFieldList,
  useFieldset,
  useForm
} from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import { useRef } from "react";
import z from "zod";

import { Field, SelectField, SubmitButton } from "~/components/form";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "~/components/ui/card";
import { prisma } from "~/utils/db.server";

import { ImageUploader } from "../resources+/image-upload";

const CorgiSchema = z.object({
  birthDate: z
    .string()
    .transform((value) => (value ? new Date(value) : undefined))
    .pipe(
      z
        .date()
        .max(new Date(), { message: "Date should be before today" })
        .optional()
    ),
  id: z.string().optional(),
  imageUri: z.string(),
  name: z.string({ required_error: "Corgi name is required" })
});

const OnboardingSchema = z.object({
  address1: z.string(),
  address2: z.string().optional(),
  city: z.string(),
  corgis: z.array(CorgiSchema).min(1),
  phone: z.string(),
  state: z.string(),
  zip: z.string()
});

export async function loader(args: DataFunctionArgs) {
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

  return { corgis, mailingAddress };
}

export async function action(args: DataFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }
  const { request } = args;
  const formData = await request.formData();
  const submission = parse(formData, {
    schema: OnboardingSchema
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

  const { corgis, ...mailingAddress } = submission.value;

  console.log({ corgis, mailingAddress });

  // TODO: upsert submission

  return redirect("/");
}

export default function Onboarding() {
  const fetcher = useFetcher<typeof action>();
  const { corgis: defaultCorgis, mailingAddress: defaultMailingAddress } =
    useLoaderData<typeof loader>();
  const { user } = useUser();

  const [form, { address1, address2, city, corgis, phone, state, zip }] =
    useForm({
      constraint: getFieldsetConstraint(OnboardingSchema),
      defaultValue: {
        ...defaultMailingAddress,
        corgis: defaultCorgis.length > 0 ? defaultCorgis : [{}]
      },
      id: "onboarding-form",
      lastSubmission: fetcher.data?.submission,
      onValidate({ formData }) {
        return parse(formData, { schema: OnboardingSchema });
      },
      shouldRevalidate: "onBlur"
    });
  const corgiList = useFieldList(form.ref, corgis);

  return (
    <div className="flex flex-col gap-4 rounded-md bg-white p-6 shadow-md">
      <div>
        <h2 className="text-2xl font-medium">Welcome {user?.firstName}</h2>
        <p className="text-sm text-gray-800">
          We'll need the following information to participate in the gift
          exchange.
        </p>
      </div>
      <fetcher.Form
        method="post"
        {...form.props}
        className="flex flex-col gap-4"
      >
        <Card>
          <CardHeader>
            <CardTitle>Mailing Address</CardTitle>
            <CardDescription>
              Please provide an address to where you'd like your secret
              santapaws to deliver gifts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field
              errors={address1.errors}
              inputProps={conform.input(address1)}
              labelProps={{ children: "Address", htmlFor: address1.id }}
            />
            <Field
              errors={address2.errors}
              inputProps={conform.input(address2)}
              labelProps={{
                children: "Apartment, suite, etc.",
                htmlFor: address2.id
              }}
            />
            <div className="flex grow flex-col md:w-full md:flex-row md:justify-evenly md:gap-4">
              <Field
                className="grow"
                errors={city.errors}
                inputProps={conform.input(city)}
                labelProps={{
                  children: "City",
                  htmlFor: city.id
                }}
              />
              <SelectField
                buttonProps={conform.input(state)}
                className="grow"
                errors={state.errors}
                labelProps={{ children: "State", htmlFor: state.id }}
                options={[
                  { label: "Alabama", value: "AL" },
                  { label: "Alaska", value: "AK" },
                  { label: "Arizona", value: "AZ" },
                  { label: "Arkansas", value: "AR" },
                  { label: "California", value: "CA" },
                  { label: "Colorado", value: "CO" },
                  { label: "Connecticut", value: "CT" },
                  { label: "Delaware", value: "DE" },
                  { label: "District Of Columbia", value: "DC" },
                  { label: "Florida", value: "FL" },
                  { label: "Georgia", value: "GA" },
                  { label: "Hawaii", value: "HI" },
                  { label: "Idaho", value: "ID" },
                  { label: "Illinois", value: "IL" },
                  { label: "Indiana", value: "IN" },
                  { label: "Iowa", value: "IA" },
                  { label: "Kansas", value: "KS" },
                  { label: "Kentucky", value: "KY" },
                  { label: "Louisiana", value: "LA" },
                  { label: "Maine", value: "ME" },
                  { label: "Maryland", value: "MD" },
                  { label: "Massachusetts", value: "MA" },
                  { label: "Michigan", value: "MI" },
                  { label: "Minnesota", value: "MN" },
                  { label: "Mississippi", value: "MS" },
                  { label: "Missouri", value: "MO" },
                  { label: "Montana", value: "MT" },
                  { label: "Nebraska", value: "NE" },
                  { label: "Nevada", value: "NV" },
                  { label: "New Hampshire", value: "NH" },
                  { label: "New Jersey", value: "NJ" },
                  { label: "New Mexico", value: "NM" },
                  { label: "New York", value: "NY" },
                  { label: "North Carolina", value: "NC" },
                  { label: "North Dakota", value: "ND" },
                  { label: "Ohio", value: "OH" },
                  { label: "Oklahoma", value: "OK" },
                  { label: "Oregon", value: "OR" },
                  { label: "Pennsylvania", value: "PA" },
                  { label: "Rhode Island", value: "RI" },
                  { label: "South Carolina", value: "SC" },
                  { label: "South Dakota", value: "SD" },
                  { label: "Tennessee", value: "TN" },
                  { label: "Texas", value: "TX" },
                  { label: "Utah", value: "UT" },
                  { label: "Vermont", value: "VT" },
                  { label: "Virginia", value: "VA" },
                  { label: "Washington", value: "WA" },
                  { label: "West Virginia", value: "WV" },
                  { label: "Wisconsin", value: "WI" },
                  { label: "Wyoming", value: "WY" }
                ]}
              />
              <Field
                className="grow"
                errors={zip.errors}
                inputProps={conform.input(zip)}
                labelProps={{
                  children: "Zip",
                  htmlFor: zip.id
                }}
              />
            </div>
            <Field
              errors={phone.errors}
              inputProps={conform.input(phone, { type: "tel" })}
              labelProps={{
                children: "Phone",
                htmlFor: phone.id
              }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              Tell us about your {corgiList.length > 1 ? "corgis" : "corgi"}
            </CardTitle>
            <CardDescription>
              The following information will be used to assist your secret santa
              paws when selecting gifts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 md:flex-row md:flex-wrap">
              {corgiList.map((corgi, index) => (
                <li
                  className="relative rounded-md border border-input p-2"
                  key={corgi.key}
                >
                  <CorgiFieldset {...corgi} />
                  {corgiList.length > 1 ? (
                    <Button
                      className="text-xs"
                      size="sm"
                      variant="destructive"
                      {...list.remove(corgis.name, { index })}
                    >
                      Remove
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full sm:w-auto"
              size="sm"
              variant="secondary"
              {...list.insert(corgis.name)}
            >
              I have another corgi
            </Button>
          </CardFooter>
        </Card>
        <SubmitButton className="w-full sm:w-auto">Submit</SubmitButton>
      </fetcher.Form>
    </div>
  );
}

function CorgiFieldset(config: FieldConfig<z.input<typeof CorgiSchema>>) {
  const ref = useRef<HTMLFieldSetElement>(null);
  const { birthDate, id, imageUri, name } = useFieldset(ref, config);

  return (
    <fieldset className="flex items-center gap-2" ref={ref}>
      <input {...conform.input(id, { type: "hidden" })} />
      {/* <div className="h-40 w-40 rounded-md bg-gray-300"></div> */}
      <ImageUploader
        className="h-40 w-40 rounded-md"
        defaultValue={imageUri.defaultValue}
        name={imageUri.name}
      />
      <div>
        <Field
          errors={name.errors}
          inputProps={conform.input(name)}
          labelProps={{ children: "Name", htmlFor: name.id }}
        />
        <Field
          className="md:grow"
          errors={birthDate.errors}
          inputProps={{
            ...conform.input(birthDate, { type: "date" }),
            max: format(new Date(), "yyyy-MM-dd")
          }}
          labelProps={{
            children: "Birth Date",
            htmlFor: birthDate.id
          }}
        />
      </div>
    </fieldset>
  );
}

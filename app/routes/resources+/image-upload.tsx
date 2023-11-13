import type { DataFunctionArgs, UploadHandler } from "@remix-run/node";

import { getAuth } from "@clerk/remix/ssr.server";
import { json, unstable_parseMultipartFormData } from "@remix-run/node";
import { type FetcherWithComponents, useFetcher } from "@remix-run/react";
import React, { useEffect, useId, useState } from "react";
import { type Accept, useDropzone } from "react-dropzone-esm";
import sharp from "sharp";

import { Icon, type IconProps } from "~/components/icon";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { cn } from "~/utils/misc";

const uploadHandler: UploadHandler = async ({
  contentType,
  data,
  filename,
  name
}) => {
  let chunks = [];
  for await (let chunk of data) {
    chunks.push(chunk);
  }

  const file = new File(chunks, filename ?? "untitled", { type: contentType });
  const buffer = Buffer.from(await file.arrayBuffer());
  const imageBuffer = await sharp(buffer).resize(512, 512).webp().toBuffer();
  const base64 = imageBuffer.toString("base64");
  return `data:image/webp;base64,${base64}`;
};

export const action = async (args: DataFunctionArgs) => {
  const { userId } = await getAuth(args);
  if (!userId) {
    throw new Response(null, { status: 401 });
  }
  const { request } = args;

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const dataUri = formData.get("fileUpload")?.toString() ?? "";

  return json({ dataUri });
};

type UploaderProps = {
  UploadIcon?: React.ReactElement<IconProps>;
  accept?: Accept;
  className?: string;
  defaultValue?: string;
  maxFileSize?: number;
  name: string;
};

export function ImageUploader({
  UploadIcon = <Icon className="h-8 w-8" name="document-plus-outline" />,
  accept = { "image/*": [".jpeg", ".png"] },
  className,
  defaultValue = "",
  maxFileSize,
  name
}: UploaderProps) {
  const fallbackId = useId();
  const id = name ?? fallbackId;
  const fetcher = useFetcherWithReset<typeof action>();
  // @ts-ignore
  const dataUri = fetcher.data?.dataUri || defaultValue;

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept,
    maxSize: maxFileSize,
    onDrop: async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles[0]);
      }
    }
  });

  const handleFileUpload = (file: File) => {
    let inputFormData = new FormData();
    inputFormData.append("fileUpload", file);
    fetcher.submit(inputFormData, {
      action: "/resources/image-upload",
      encType: "multipart/form-data",
      method: "POST"
    });
  };

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    fetcher.reset();
  };

  return (
    <div
      {...getRootProps({
        className: cn(
          "border-rounded flex items-center justify-center rounded border-dashed p-1 transition duration-300 ease-in-out",
          isDragActive
            ? "border-4 border-yellow-300"
            : "border-2 border-gray-400",
          className
        )
      })}
    >
      {dataUri ? (
        <div className="relative">
          <img
            alt="uploaded file"
            className="text-brand-deep-purple aspect-auto h-full rounded"
            src={dataUri}
          />
          <Button
            className="absolute right-2 top-2 h-4 w-4 bg-transparent"
            onClick={handleClear}
            size="icon"
            type="button"
            variant="destructive"
          >
            <Icon className="h-4 w-4" name="x-circle" />
          </Button>
        </div>
      ) : (
        <div className="pointer-events-none flex select-none flex-col items-center">
          {UploadIcon}
          <p className="text-gray-700">Drop image here</p>
          <p className="mb-1 text-sm text-gray-700">or</p>
          <Label
            className="pointer-events-auto inline-flex h-6 cursor-pointer items-center rounded border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2"
            htmlFor={id}
          >
            Select image
          </Label>
          <input {...getInputProps({ className: "sr-only", id })} />
          <p className="mt-4 text-center text-xs text-gray-600">
            Images will be resized to 512x512.
          </p>
        </div>
      )}
      <input name={name} type="hidden" value={dataUri} />
    </div>
  );
}

export type FetcherWithComponentsReset<T> = FetcherWithComponents<T> & {
  reset: () => void;
};

export function useFetcherWithReset<T>(): FetcherWithComponentsReset<T> {
  const fetcher = useFetcher<T>();
  const [data, setData] = useState(fetcher.data);
  useEffect(() => {
    if (fetcher.state === "idle") {
      setData(fetcher.data);
    }
  }, [fetcher.state, fetcher.data]);
  return {
    ...fetcher,
    data: data as T,
    reset: () => setData(undefined)
  };
}

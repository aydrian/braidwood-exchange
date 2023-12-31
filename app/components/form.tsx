import { type FieldConfig, conform, useInputEvent } from "@conform-to/react";
import React, { useId, useRef } from "react";
import {
  type InputAttributes,
  PatternFormat,
  type PatternFormatProps
} from "react-number-format";

import { Button, type ButtonProps } from "~/components/ui/button";
import { Checkbox, type CheckboxProps } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  type SelectProps,
  SelectTrigger,
  SelectValue
} from "./ui/select";

export type ListOfErrors = Array<null | string | undefined> | null | undefined;

export function ErrorList({
  errors,
  id
}: {
  errors?: ListOfErrors;
  id?: string;
}) {
  const errorsToRender = errors?.filter(Boolean);
  if (!errorsToRender?.length) return null;
  return (
    <ul className="flex flex-col gap-1" id={id}>
      {errorsToRender.map((e) => (
        <li className="text-[10px] text-red-600" key={e}>
          {e}
        </li>
      ))}
    </ul>
  );
}

export function Field({
  className,
  errors,
  inputProps,
  labelProps
}: {
  className?: string;
  errors?: ListOfErrors;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
}) {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <Label htmlFor={id} {...labelProps} />
      <Input
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
        id={id}
        {...inputProps}
      />
      <div className="min-h-[32px] px-4 py-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function conformPhoneInput(
  config: FieldConfig<string>,
  options?: PatternFormatProps<InputAttributes>
): PatternFormatProps<InputAttributes> {
  const { type, ...inputProps } = conform.input(config);
  return {
    format: options?.format ?? "+1 (###) ###-####",
    type: "tel",
    ...inputProps
  };
}

export function PhoneField({
  className,
  errors,
  inputProps,
  labelProps
}: {
  className?: string;
  errors?: ListOfErrors;
  format?: string;
  inputProps: PatternFormatProps<InputAttributes>;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
}) {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <Label htmlFor={id} {...labelProps} />
      <PatternFormat
        allowEmptyFormatting
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        id={id}
        mask="_"
        {...inputProps}
      />
      <div className="min-h-[32px] px-4 py-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function TextareaField({
  className,
  errors,
  labelProps,
  textareaProps
}: {
  className?: string;
  errors?: ListOfErrors;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  textareaProps: React.InputHTMLAttributes<HTMLTextAreaElement>;
}) {
  const fallbackId = useId();
  const id = textareaProps.id ?? textareaProps.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <Label htmlFor={id} {...labelProps} />
      <Textarea
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
        id={id}
        {...textareaProps}
      />
      <div className="min-h-[32px] px-4 py-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function SelectField({
  buttonProps,
  className,
  errors,
  labelProps,
  options
}: {
  buttonProps: SelectProps;
  className?: string;
  errors?: ListOfErrors;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  options: { label: string; value: string }[];
}) {
  const [open, setOpen] = React.useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const control = useInputEvent({
    onFocus: () => buttonRef.current?.focus(),
    ref: () =>
      buttonRef.current?.form?.elements.namedItem(buttonProps.name ?? "")
  });
  const fallbackId = useId();
  const id = buttonProps.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  const { name, ...props } = buttonProps;

  return (
    <div className={className}>
      <Label htmlFor={id} {...labelProps} />
      <Select
        defaultValue={
          buttonProps.defaultValue
            ? String(buttonProps.defaultValue)
            : undefined
        }
        name={name}
        onOpenChange={setOpen}
        open={open}
      >
        <SelectTrigger
          aria-describedby={errorId}
          aria-invalid={errorId ? true : undefined}
          id={id}
          ref={buttonRef}
          {...props}
          onBlur={(event) => {
            control.blur();
            buttonProps.onBlur?.(event);
          }}
          onChange={(state) => {
            control.change(state.currentTarget.value);
            buttonProps.onChange?.(state);
          }}
          onFocus={(event) => {
            control.focus();
            buttonProps.onFocus?.(event);
          }}
          type="button"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup className="max-h-[10rem] overflow-y-auto">
            {options.map(({ label, value }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="px-4 py-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function CheckboxField({
  buttonProps,
  className,
  errors,
  labelProps
}: {
  buttonProps: CheckboxProps;
  className?: string;
  errors?: ListOfErrors;
  labelProps: JSX.IntrinsicElements["label"];
}) {
  const fallbackId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  // To emulate native events that Conform listen to:
  // See https://conform.guide/integrations
  const control = useInputEvent({
    // Retrieve the checkbox element by name instead as Radix does not expose the internal checkbox element
    onFocus: () => buttonRef.current?.focus(),
    // See https://github.com/radix-ui/primitives/discussions/874
    ref: () =>
      buttonRef.current?.form?.elements.namedItem(buttonProps.name ?? "")
  });
  const id = buttonProps.id ?? buttonProps.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <div className="flex gap-2">
        <Checkbox
          aria-describedby={errorId}
          aria-invalid={errorId ? true : undefined}
          id={id}
          ref={buttonRef}
          {...buttonProps}
          onBlur={(event) => {
            control.blur();
            buttonProps.onBlur?.(event);
          }}
          onCheckedChange={(state) => {
            control.change(Boolean(state.valueOf()));
            buttonProps.onCheckedChange?.(state);
          }}
          onFocus={(event) => {
            control.focus();
            buttonProps.onFocus?.(event);
          }}
          type="button"
        />
        <label
          htmlFor={id}
          {...labelProps}
          className="text-body-xs self-center text-muted-foreground"
        />
      </div>
      <div className="px-4 py-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}

export function SubmitButton({
  state = "idle",
  submittingText = "Submitting...",
  ...props
}: ButtonProps & {
  state?: "idle" | "loading" | "submitting";
  submittingText?: string;
}) {
  return (
    <Button
      {...props}
      className={props.className}
      disabled={props.disabled || state !== "idle"}
    >
      <span>{state !== "idle" ? submittingText : props.children}</span>
    </Button>
  );
}

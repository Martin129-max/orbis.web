import type { ComponentProps } from "react";
import * as Atom from "@atom";

type FormFieldProps = ComponentProps<typeof Atom.Input> & { label: string };

export function FormField({ label, ...inputProps }: FormFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <Atom.Input {...inputProps} />
    </label>
  );
}

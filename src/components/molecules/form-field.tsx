import type { ComponentProps } from "react";
import { Input } from "@/components/atoms/input";

type FormFieldProps = ComponentProps<typeof Input> & { label: string };

export function FormField({ label, ...inputProps }: FormFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <Input {...inputProps} />
    </label>
  );
}

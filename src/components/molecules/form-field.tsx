"use client";

import { Form } from "antd";
import { useId, type ComponentProps } from "react";
import * as Atom from "@atom";

type FormFieldProps = ComponentProps<typeof Atom.Input> & { label: string };

export function FormField({ label, id, ...inputProps }: FormFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <Form.Item
      label={label}
      htmlFor={inputId}
      layout="vertical"
      required={inputProps.required}
      className="m-0"
    >
      <Atom.Input id={inputId} {...inputProps} />
    </Form.Item>
  );
}

"use client";

import { Form } from "antd";
import { useId, type ComponentProps, type ReactNode } from "react";
import * as Atom from "@atom";

type FormFieldProps = ComponentProps<typeof Atom.Input> & {
  label: string;
  extra?: ReactNode;
};

export function FormField({ label, id, extra, ...inputProps }: FormFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <Form.Item
      label={label}
      htmlFor={inputId}
      layout="vertical"
      required={inputProps.required}
      extra={extra}
      className="m-0"
    >
      <Atom.Input id={inputId} {...inputProps} />
    </Form.Item>
  );
}

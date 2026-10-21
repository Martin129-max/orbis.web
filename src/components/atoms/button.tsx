import { Button as AntButton, type ButtonProps as AntButtonProps } from "antd";

const variants = {
  primary: "primary",
  secondary: "default",
  text: "text",
} as const;

type ButtonProps = Omit<AntButtonProps, "type" | "htmlType" | "variant"> & {
  type?: AntButtonProps["htmlType"];
  variant?: keyof typeof variants;
};

export function Button({ variant = "primary", type, ...props }: ButtonProps) {
  return <AntButton type={variants[variant]} htmlType={type} {...props} />;
}

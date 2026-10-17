import { Alert } from "antd";
import type { ReactNode } from "react";

export function ErrorMessage({ children }: { children: ReactNode }) {
  return <Alert type="error" showIcon title={children} />;
}

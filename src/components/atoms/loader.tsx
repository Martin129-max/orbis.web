import { Spin } from "antd";

export function Loader() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex flex-1 items-center justify-center"
    >
      <Spin size="large" />
    </div>
  );
}

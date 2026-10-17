import { api } from "@/lib/api";

export async function ServerStatus() {
  const status = await api("/")
    .then((res) => res.text())
    .catch(() => "Server unreachable");
  return <p>{status}</p>;
}

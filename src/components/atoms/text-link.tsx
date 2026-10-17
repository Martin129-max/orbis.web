import Link from "next/link";
import type { ComponentProps } from "react";

export function TextLink(props: ComponentProps<typeof Link>) {
  return <Link className="underline" {...props} />;
}

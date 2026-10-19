"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { Button } from "./button";

type ButtonLinkProps = Omit<ComponentProps<typeof Button>, "href" | "onClick" | "type"> & {
  href: string;
};

export function ButtonLink({ href, ...props }: ButtonLinkProps) {
  const router = useRouter();

  return (
    <Button
      href={href}
      onClick={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        router.push(href);
      }}
      {...props}
    />
  );
}

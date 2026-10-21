import Image from "next/image";
import type { ReactNode } from "react";

export function AuthTemplate({
  illustration,
  children,
}: {
  illustration: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-1">
      <main className="flex w-full flex-col p-6 sm:p-16 lg:w-1/2">
        {children}
      </main>
      <aside className="fixed inset-y-0 right-0 hidden w-1/2 lg:block">
        <Image
          src={illustration}
          alt="Friends gathered around a table full of manga, sketchbooks, and ramen"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
      </aside>
    </div>
  );
}

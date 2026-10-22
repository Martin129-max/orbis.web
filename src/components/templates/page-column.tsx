import type { ReactNode, UIEvent } from "react";

export function PageColumn({
  children,
  onScroll,
}: {
  children: ReactNode;
  onScroll?: (event: UIEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className="min-w-0 flex-1 overflow-y-auto px-4 sm:px-8"
      onScroll={onScroll}
    >
      <div className="mx-auto w-full max-w-[672px] pt-6 pb-12 sm:pt-8 lg:max-w-[760px] xl:max-w-[880px] 2xl:max-w-[1040px]">
        {children}
      </div>
    </div>
  );
}

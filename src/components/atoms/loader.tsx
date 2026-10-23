import { LogoMark } from "./logo-mark";

export function Loader() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex flex-1 items-center justify-center"
    >
      <span
        aria-hidden
        className="flex font-display text-[32px] leading-none font-extrabold text-accent motion-reduce:animate-pulse"
      >
        <LogoMark animation="loop" />
      </span>
    </div>
  );
}

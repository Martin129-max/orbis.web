"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

const bar = {
  element: null as HTMLDivElement | null,
  value: 0,
  active: false,
  trickle: undefined as ReturnType<typeof setInterval> | undefined,
  hide: undefined as ReturnType<typeof setTimeout> | undefined,
  safety: undefined as ReturnType<typeof setTimeout> | undefined,
};

function paint(value: number, visible: boolean) {
  bar.value = value;
  if (!bar.element) return;
  bar.element.style.width = `${value}%`;
  bar.element.style.opacity = visible ? "1" : "0";
}

function clearTimers() {
  clearInterval(bar.trickle);
  clearTimeout(bar.hide);
  clearTimeout(bar.safety);
}

function startLoading() {
  clearTimers();
  bar.active = true;
  paint(Math.max(bar.value, 12), true);
  bar.trickle = setInterval(() => paint(bar.value + (90 - bar.value) * 0.12, true), 200);
  bar.safety = setTimeout(finishLoading, 10000);
}

function finishLoading() {
  if (!bar.active) return;
  bar.active = false;
  clearTimers();
  paint(100, true);
  bar.hide = setTimeout(() => {
    paint(100, false);
    bar.hide = setTimeout(() => paint(0, false), 300);
  }, 200);
}

function isPageNavigation(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return false;
  }
  const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!(anchor instanceof HTMLAnchorElement)) return false;
  if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) {
    return false;
  }
  const url = new URL(anchor.href, window.location.href);
  return (
    url.origin === window.location.origin &&
    (url.pathname !== window.location.pathname || url.search !== window.location.search)
  );
}

function LoadingBar() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const element = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bar.element = element.current;
    const handleClick = (event: MouseEvent) => {
      if (isPageNavigation(event)) startLoading();
    };
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      clearTimers();
      bar.element = null;
    };
  }, []);

  useEffect(() => {
    finishLoading();
  }, [pathname, search]);

  return (
    <div
      ref={element}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[2000] h-0.5 w-0 bg-accent opacity-0 shadow-[0_0_8px_var(--color-accent)] transition-[width,opacity] duration-200 ease-out motion-reduce:transition-none"
    />
  );
}

export function TopLoadingBar() {
  return (
    <Suspense fallback={null}>
      <LoadingBar />
    </Suspense>
  );
}

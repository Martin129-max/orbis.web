const animations = {
  hover: {
    o: "group-hover:animate-logo-squish group-focus-visible:animate-logo-squish",
    dot: "group-hover:animate-logo-orbit group-focus-visible:animate-logo-orbit",
  },
  loop: {
    o: "animate-logo-squish-loop",
    dot: "animate-logo-orbit-loop",
  },
};

export function LogoMark({ animation }: { animation: keyof typeof animations }) {
  const { o, dot } = animations[animation];

  return (
    <>
      <span className={`inline-block origin-bottom motion-reduce:animate-none! ${o}`}>o</span>
      <span
        className={`inline-block origin-[-0.23em_0.64em] motion-reduce:animate-none! ${dot}`}
      >
        .
      </span>
    </>
  );
}

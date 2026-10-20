import * as Atom from "@atom";

export function ConnectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 text-center">
      <div className="flex flex-col gap-1">
        <p className="font-medium">Can&apos;t reach Orbis right now</p>
        <p className="text-sm text-zinc-500">
          Check your connection, then try again.
        </p>
      </div>
      <Atom.Button variant="secondary" onClick={onRetry}>
        Try again
      </Atom.Button>
    </div>
  );
}

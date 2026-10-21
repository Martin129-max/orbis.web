"use client";

import { useRef, useState, type ChangeEvent } from "react";
import * as Atom from "@atom";

export function ImagePicker({
  noun,
  hasImage,
  disabled,
  onUpload,
  onRemove,
}: {
  noun: string;
  hasImage: boolean;
  disabled?: boolean;
  onUpload: (file: File) => Promise<unknown>;
  onRemove: () => Promise<unknown>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: "upload" | "remove", request: () => Promise<unknown>) {
    setPending(action);
    setError(null);
    try {
      await request();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setPending(null);
    }
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) run("upload", () => onUpload(file));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFile}
        />
        <Atom.Button
          size="small"
          variant="secondary"
          loading={pending === "upload"}
          disabled={disabled || pending !== null}
          onClick={() => input.current?.click()}
        >
          {hasImage ? `Change ${noun}` : `Upload ${noun}`}
        </Atom.Button>
        {hasImage && (
          <Atom.Button
            size="small"
            variant="text"
            loading={pending === "remove"}
            disabled={disabled || pending !== null}
            onClick={() => run("remove", onRemove)}
          >
            Remove {noun}
          </Atom.Button>
        )}
      </div>
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
    </div>
  );
}

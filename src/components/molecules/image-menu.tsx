"use client";

import { App, Dropdown } from "antd";
import { ImageUp, Trash2 } from "lucide-react";
import { useRef, useState, type ChangeEvent, type ReactNode } from "react";

export function ImageMenu({
  noun,
  hasImage,
  onUpload,
  onRemove,
  children,
}: {
  noun: string;
  hasImage: boolean;
  onUpload: (file: File) => Promise<unknown>;
  onRemove: () => Promise<unknown>;
  children: (busy: boolean) => ReactNode;
}) {
  const { message } = App.useApp();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function run(request: () => Promise<unknown>) {
    setBusy(true);
    try {
      await request();
    } catch (cause) {
      message.error((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) run(() => onUpload(file));
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFile}
      />
      <Dropdown
        trigger={["click"]}
        disabled={busy}
        menu={{
          items: [
            {
              key: "upload",
              icon: <ImageUp size={16} />,
              label: hasImage ? `Change ${noun}` : `Upload ${noun}`,
            },
            ...(hasImage
              ? [
                  {
                    key: "remove",
                    icon: <Trash2 size={16} />,
                    label: `Remove ${noun}`,
                    danger: true,
                  },
                ]
              : []),
          ],
          onClick: ({ key }) => {
            if (key === "upload") input.current?.click();
            else run(onRemove);
          },
        }}
      >
        {children(busy)}
      </Dropdown>
    </>
  );
}

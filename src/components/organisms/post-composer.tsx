"use client";

import { Bold, Code, Italic, Link as LinkIcon, List, ListOrdered, Strikethrough, Underline } from "lucide-react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button, Tooltip } from "antd";
import { useState, type ReactNode } from "react";
import * as Atom from "@atom";

type PostComposerProps = {
  onPost: (content: string) => Promise<void>;
  target?: ReactNode;
  placeholder?: string;
  submitLabel?: string;
  allowEmpty?: boolean;
  autoFocus?: boolean;
  onCancel?: () => void;
  onPosted?: () => void;
};

export function PostComposer({
  onPost,
  target,
  placeholder = "Share something with the community…",
  submitLabel = "Post",
  allowEmpty = false,
  autoFocus = false,
  onCancel,
  onPosted,
}: PostComposerProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    autofocus: autoFocus,
    extensions: [
      StarterKit.configure({
        heading: false,
        horizontalRule: false,
        trailingNode: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["http", "https", "mailto"],
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: "rich-text min-h-24 px-4 py-3 outline-none",
        "aria-label": "Write a post",
        role: "textbox",
        "aria-multiline": "true",
      },
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      empty: editor?.isEmpty ?? true,
      bold: editor?.isActive("bold") ?? false,
      italic: editor?.isActive("italic") ?? false,
      underline: editor?.isActive("underline") ?? false,
      strike: editor?.isActive("strike") ?? false,
      code: editor?.isActive("code") ?? false,
      bulletList: editor?.isActive("bulletList") ?? false,
      orderedList: editor?.isActive("orderedList") ?? false,
      link: editor?.isActive("link") ?? false,
    }),
  });

  async function submit() {
    if (!editor || (editor.isEmpty && !allowEmpty) || pending) return;
    setError(null);
    setPending(true);

    try {
      await onPost(editor.getHTML());
      editor.commands.clearContent(true);
      setPending(false);
      onPosted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPending(false);
    }
  }

  function toggleLink() {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const href = window.prompt("Link URL");
    if (href) editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }

  const tools: { label: string; icon: ReactNode; active?: boolean; run: () => void }[] = [
    { label: "Bold", icon: <Bold size={16} />, active: state?.bold, run: () => editor?.chain().focus().toggleBold().run() },
    { label: "Italic", icon: <Italic size={16} />, active: state?.italic, run: () => editor?.chain().focus().toggleItalic().run() },
    { label: "Underline", icon: <Underline size={16} />, active: state?.underline, run: () => editor?.chain().focus().toggleUnderline().run() },
    { label: "Strikethrough", icon: <Strikethrough size={16} />, active: state?.strike, run: () => editor?.chain().focus().toggleStrike().run() },
    { label: "Inline code", icon: <Code size={16} />, active: state?.code, run: () => editor?.chain().focus().toggleCode().run() },
    { label: "Bulleted list", icon: <List size={16} />, active: state?.bulletList, run: () => editor?.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", icon: <ListOrdered size={16} />, active: state?.orderedList, run: () => editor?.chain().focus().toggleOrderedList().run() },
    { label: state?.link ? "Remove link" : "Add link", icon: <LinkIcon size={16} />, active: state?.link, run: toggleLink },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div
        className="rounded-xl border border-black/15 bg-surface focus-within:border-accent dark:border-white/20 dark:focus-within:border-accent"
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            submit();
          }
        }}
      >
        <div
          role="toolbar"
          aria-label="Formatting"
          className="flex flex-wrap gap-1 border-b border-black/10 px-2 py-1.5 dark:border-white/10"
        >
          {tools.map((tool) => (
            <Tooltip key={tool.label} title={tool.label}>
              <Button
                type={tool.active ? "primary" : "text"}
                size="small"
                icon={tool.icon}
                aria-label={tool.label}
                aria-pressed={tool.active}
                onMouseDown={(event) => event.preventDefault()}
                onClick={tool.run}
              />
            </Tooltip>
          ))}
        </div>
        <div className="relative">
          {state?.empty && (
            <p className="pointer-events-none absolute top-3 left-4 text-muted">
              {placeholder}
            </p>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
      <div className="flex items-center justify-end gap-3">
        {target && <div className="mr-auto min-w-0">{target}</div>}
        <span className="hidden text-xs text-muted sm:inline">
          ⌘/Ctrl + Enter to post
        </span>
        {onCancel && (
          <Atom.Button variant="secondary" onClick={onCancel}>
            Cancel
          </Atom.Button>
        )}
        <Atom.Button
          onClick={submit}
          loading={pending}
          disabled={state?.empty && !allowEmpty}
        >
          {submitLabel}
        </Atom.Button>
      </div>
    </div>
  );
}

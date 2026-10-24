"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Tooltip } from "antd";
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as Atom from "@atom";
import * as Molecule from "@molecule";
import { previewFor, TEXT_LINK, trimLink, webUrl, youtubeVideo } from "@/lib/links";
import { useAuthStore } from "@/stores/auth-store";

const PREVIEW_DELAY_MS = 500;
const BARE_LINK = /^(?:https?:\/\/|www\.)\S+$/i;

type FoundLink = { url: string; from: number; to: number; removable: boolean };

function findFirstLink(editor: Editor) {
  let found = null as FoundLink | null;
  editor.state.doc.descendants((node, pos) => {
    if (found) return false;
    if (!node.isText || !node.text) return true;

    const mark = node.marks.find(({ type }) => type.name === "link");
    if (mark) {
      const url = webUrl(String(mark.attrs.href ?? ""));
      if (url) {
        found = { url, from: pos, to: pos + node.text.length, removable: BARE_LINK.test(node.text.trim()) };
      }
      return !found;
    }

    const match = node.text.match(TEXT_LINK);
    if (match?.index !== undefined) {
      const raw = trimLink(match[0]);
      const url = webUrl(raw);
      if (url) {
        found = { url, from: pos + match.index, to: pos + match.index + raw.length, removable: true };
      }
    }
    return !found;
  });
  return found;
}

function removeLinkText(editor: Editor, { from, to }: FoundLink) {
  const { doc } = editor.state;
  const after = doc.textBetween(to, Math.min(to + 1, doc.content.size));
  const before = doc.textBetween(Math.max(from - 1, 0), from);
  const range =
    after === " " ? { from, to: to + 1 } : before === " " ? { from: from - 1, to } : { from, to };
  editor.chain().deleteRange(range).run();
}

type PostComposerProps = {
  onPost: (content: string, linkUrl?: string) => Promise<void>;
  target?: ReactNode;
  placeholder?: string;
  submitLabel?: string;
  allowEmpty?: boolean;
  autoFocus?: boolean;
  onCancel?: () => void;
  onPosted?: () => void;
  linkPreview?: boolean;
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
  linkPreview = false,
}: PostComposerProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  const attached = useRef<string | null>(null);
  const dismissed = useRef(false);
  const checking = useRef<string | null>(null);
  const rejected = useRef(new Set<string>());

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
        class: "rich-text min-h-12 outline-none",
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
      html: linkPreview ? (editor?.getHTML() ?? "") : "",
    }),
  });
  const html = state?.html ?? "";

  useEffect(() => {
    if (!linkPreview || !editor || attachment) return;

    const timer = setTimeout(async () => {
      if (editor.isEmpty) {
        dismissed.current = false;
        return;
      }
      const { token } = useAuthStore.getState();
      const found = findFirstLink(editor);
      if (
        !found ||
        !token ||
        dismissed.current ||
        rejected.current.has(found.url) ||
        checking.current === found.url
      ) {
        return;
      }

      checking.current = found.url;
      const embeddable =
        youtubeVideo(found.url) !== null || (await previewFor(token, found.url)) !== null;
      checking.current = null;
      if (!embeddable) {
        rejected.current.add(found.url);
        return;
      }

      const current = findFirstLink(editor);
      if (dismissed.current || attached.current || current?.url !== found.url) return;
      attached.current = found.url;
      setAttachment(found.url);
      if (current.removable) removeLinkText(editor, current);
    }, PREVIEW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [linkPreview, editor, attachment, html]);

  function removeAttachment() {
    attached.current = null;
    dismissed.current = true;
    setAttachment(null);
  }

  async function submit() {
    if (!editor || (editor.isEmpty && !allowEmpty && !attachment) || pending) return;
    setError(null);
    setPending(true);

    try {
      await onPost(editor.getHTML(), attachment ?? undefined);
      editor.commands.clearContent(true);
      attached.current = null;
      dismissed.current = false;
      rejected.current.clear();
      setAttachment(null);
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

  const tools: {
    label: string;
    glyph: ReactNode;
    active?: boolean;
    run: () => void;
  }[] = [
    { label: "Bold", glyph: <span className="font-extrabold">B</span>, active: state?.bold, run: () => editor?.chain().focus().toggleBold().run() },
    { label: "Italic", glyph: <span className="font-medium italic">I</span>, active: state?.italic, run: () => editor?.chain().focus().toggleItalic().run() },
    { label: "Underline", glyph: <span className="font-medium underline">U</span>, active: state?.underline, run: () => editor?.chain().focus().toggleUnderline().run() },
    { label: "Strikethrough", glyph: <span className="font-medium line-through">S</span>, active: state?.strike, run: () => editor?.chain().focus().toggleStrike().run() },
    { label: "Inline code", glyph: "</>", active: state?.code, run: () => editor?.chain().focus().toggleCode().run() },
    { label: "Bulleted list", glyph: "≡", active: state?.bulletList, run: () => editor?.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", glyph: "1.", active: state?.orderedList, run: () => editor?.chain().focus().toggleOrderedList().run() },
    { label: state?.link ? "Remove link" : "Add link", glyph: "↗", active: state?.link, run: toggleLink },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex flex-col gap-4 rounded-lg border border-divider bg-surface p-4 transition-colors focus-within:border-accent"
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            submit();
          }
        }}
      >
        {target}
        <div className="relative">
          {state?.empty && (
            <p className="pointer-events-none absolute top-0 left-0 text-sm text-muted">
              {placeholder}
            </p>
          )}
          <EditorContent editor={editor} />
        </div>
        {attachment && <Molecule.LinkPreview url={attachment} onRemove={removeAttachment} />}
        <hr className="border-divider" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="toolbar"
            aria-label="Formatting"
            className="flex flex-wrap items-center gap-1 text-[13px] font-medium"
          >
            {tools.map((tool) => (
              <Tooltip key={tool.label} title={tool.label}>
                <button
                  type="button"
                  aria-label={tool.label}
                  aria-pressed={tool.active}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={tool.run}
                  className={`focus-ring flex h-7 min-w-7 items-center justify-center rounded-md px-1 transition-colors ${
                    tool.active
                      ? "bg-accent-soft text-accent"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {tool.glyph}
                </button>
              </Tooltip>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {onCancel && (
              <Atom.Button size="small" variant="secondary" onClick={onCancel}>
                Cancel
              </Atom.Button>
            )}
            <Atom.Button
              size="small"
              onClick={submit}
              loading={pending}
              disabled={state?.empty && !allowEmpty && !attachment}
            >
              {submitLabel}
            </Atom.Button>
          </div>
        </div>
      </div>
      {error && <Atom.ErrorMessage>{error}</Atom.ErrorMessage>}
    </div>
  );
}

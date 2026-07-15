'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import { normalizeCmsBodyToHtml } from '@/lib/cms/cms-body';
import { cn } from '@/lib/utils';

/**
 * TipTap editor for Policies, Documentation, and Blog Articles.
 * Remount via `key` when switching pages/sections so `value` is applied once.
 * @param {{ value: string, onChange: (html: string) => void, className?: string, minHeightClass?: string }} props
 */
export function AdminRichTextEditor({
  value,
  onChange,
  className,
  minHeightClass = 'min-h-40',
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2',
        },
      }),
    ],
    content: normalizeCmsBodyToHtml(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none px-3 py-2 focus:outline-none',
          minHeightClass,
        ),
      },
    },
    onUpdate: ({ editor: next }) => {
      onChange(next.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className={cn('rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground', minHeightClass)}>
        Loading editor…
      </div>
    );
  }

  function setLink() {
    const previous = editor.getAttributes('link').href ?? '';
    const href = window.prompt('Link URL', previous);
    if (href === null) {
      return;
    }

    if (!href.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run();
  }

  return (
    <div className={cn('overflow-hidden rounded-md border border-input bg-background', className)}>
      <div className="flex flex-wrap gap-1 border-b border-border/70 bg-muted/40 p-1.5">
        <ToolbarButton
          label="H2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="H3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarButton
          label="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="• List"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="1. List"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton label="Link" active={editor.isActive('link')} onClick={setLink} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({ label, active, onClick }) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? 'secondary' : 'ghost'}
      className="h-7 px-2 text-xs"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

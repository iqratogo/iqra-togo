"use client"

/* §7.2.1 Éditeur WYSIWYG TipTap */

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import {
  Bold, Italic, Strikethrough, List, ListOrdered,
  Heading2, Heading3, Quote, Link as LinkIcon,
  Image as ImageIcon, Undo, Redo, Code,
} from "lucide-react"
import { useCallback } from "react"
import { cn } from "@/lib/utils"

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

function ToolBtn({
  onClick, active, title, children,
}: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "rounded p-1.5 transition-colors hover:bg-gray-100",
        active && "bg-gray-200 text-[var(--azae-orange)]"
      )}
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({ value, onChange, placeholder, className }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ HTMLAttributes: { class: "rounded-lg max-w-full" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-[var(--azae-orange)] underline" } }),
      Placeholder.configure({ placeholder: placeholder ?? "Commencez à rédiger…" }),
      CharacterCount,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none",
      },
    },
  })

  const addLink = useCallback(() => {
    const url = window.prompt("URL du lien:")
    if (!url || !editor) return
    editor.chain().focus().setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    const url = window.prompt("URL de l'image:")
    if (!url || !editor) return
    editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-100 bg-gray-50 p-2">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Gras">
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italique">
          <Italic className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Barré">
          <Strikethrough className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Code inline">
          <Code className="h-4 w-4" />
        </ToolBtn>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Titre 2">
          <Heading2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Titre 3">
          <Heading3 className="h-4 w-4" />
        </ToolBtn>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Liste à puces">
          <List className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Liste numérotée">
          <ListOrdered className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Citation">
          <Quote className="h-4 w-4" />
        </ToolBtn>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        <ToolBtn onClick={addLink} active={editor.isActive("link")} title="Insérer un lien">
          <LinkIcon className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={addImage} title="Insérer une image">
          <ImageIcon className="h-4 w-4" />
        </ToolBtn>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Annuler">
          <Undo className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Rétablir">
          <Redo className="h-4 w-4" />
        </ToolBtn>

        <span className="ml-auto text-xs text-gray-400">
          {editor.storage.characterCount?.characters() ?? 0} car.
        </span>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

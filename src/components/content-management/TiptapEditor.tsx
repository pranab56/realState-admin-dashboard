"use client";

import { cn } from "@/lib/utils";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Italic,
  Link2,
  List, ListOrdered,
  Maximize2,
  Underline as UnderlineIcon
} from "lucide-react";

interface TiptapEditorProps {
  content: string;
  onChange: (richText: string) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm focus:outline-none max-w-none min-h-[350px] p-6 text-gray-700",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleCode = () => editor.chain().focus().toggleCode().run();

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const ToolbarButton = ({
    onClick,
    isActive = false,
    children
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-1.5 rounded transition-colors cursor-pointer hover:bg-white",
        isActive ? "bg-white text-[#F1913D] shadow-sm" : "text-gray-600"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="border rounded-xl overflow-hidden bg-[#FAFAFA]" style={{ borderColor: "#F2F2F2" }}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-[#FEF0E4]/30" style={{ borderColor: "#F2F2F2" }}>
        <ToolbarButton onClick={toggleBold} isActive={editor.isActive("bold")}>
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={toggleItalic} isActive={editor.isActive("italic")}>
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={toggleUnderline} isActive={editor.isActive("underline")}>
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        <ToolbarButton onClick={toggleBulletList} isActive={editor.isActive("bulletList")}>
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={toggleOrderedList} isActive={editor.isActive("orderedList")}>
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        <ToolbarButton onClick={setLink} isActive={editor.isActive("link")}>
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={toggleCode} isActive={editor.isActive("code")}>
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <div className="flex-1" />

        <button type="button" className="p-1.5 rounded hover:bg-white transition-colors cursor-pointer text-gray-600">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* CSS to handle placeholders and basic prose styling if needed */}
      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .tiptap:focus {
          outline: none;
        }
        .tiptap ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin: 0.5rem 0 !important;
        }
        .tiptap ol {
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin: 0.5rem 0 !important;
        }
        .tiptap ul li,
        .tiptap ol li {
          display: list-item !important;
        }
        .tiptap ul li p,
        .tiptap ol li p {
          margin: 0.15rem 0;
        }
        .tiptap ul li::marker {
          color: #6B7280;
        }
        .tiptap ol li::marker {
          color: #6B7280;
          font-weight: 500;
        }
        .tiptap blockquote {
          border-left: 3px solid #F1913D;
          padding-left: 1rem;
          margin: 0.75rem 0;
          color: #6B7280;
          font-style: italic;
        }
        .tiptap h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 1rem 0 0.5rem;
        }
        .tiptap h2 {
          font-size: 1.35rem;
          font-weight: 600;
          margin: 0.85rem 0 0.4rem;
        }
        .tiptap h3 {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 0.75rem 0 0.35rem;
        }
        .tiptap a {
          color: #F1913D;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

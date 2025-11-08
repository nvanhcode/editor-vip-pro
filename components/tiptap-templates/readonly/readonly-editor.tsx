"use client"

import { useEffect } from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"

// --- Tiptap Node ---
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import { DetailsNode } from "@/components/tiptap-node/details-node/details-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"
import "@/components/tiptap-node/details-node/details-node.scss"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"
import "@/components/tiptap-templates/readonly/readonly-editor.scss"

interface ReadonlyEditorProps {
  content?: string
  onContentRendered?: () => void
}

export function ReadonlyEditor({ content, onContentRendered }: ReadonlyEditorProps = {}) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editable: false, // Đặt editor thành readonly
    editorProps: {
      attributes: {
        class: "simple-editor readonly-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: true, // Cho phép click vào link
          enableClickSelection: false,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Image,
      Typography,
      Superscript,
      Subscript,
      DetailsNode,
      // Loại bỏ ImageUploadNode vì không cần upload trong readonly
    ],
    content: content || '',
  })

  // Cập nhật content khi prop content thay đổi
  useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      queueMicrotask(() => {
        editor.commands.setContent(content)
        // Gọi callback sau khi content đã được render
        setTimeout(() => {
          onContentRendered?.()
        }, 100)
      })
    }
  }, [editor, content, onContentRendered])

  // Gọi callback khi editor được khởi tạo lần đầu
  useEffect(() => {
    if (editor && content) {
      setTimeout(() => {
        onContentRendered?.()
      }, 100)
    }
  }, [editor, content, onContentRendered])

  return (
    <div className="simple-editor-wrapper readonly-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content readonly-content"
        />
      </EditorContext.Provider>
    </div>
  )
}
/* eslint-disable react-hooks/refs */
"use client"

import { useEffect, useRef, useState } from "react"
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
import { Selection } from "@tiptap/extensions"
import { Placeholder } from "@tiptap/extension-placeholder"
import Youtube from "@tiptap/extension-youtube"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
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

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import { DetailsButton } from "@/components/tiptap-ui/details-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
  TextColorPopover,
  TextColorPopoverContent,
  TextColorPopoverButton,
} from "@/components/tiptap-ui/text-color-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { YoutubeButton, YoutubePopoverButton, YoutubePopoverContent } from "@/components/tiptap-ui/youtube-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { TextColorIcon } from "@/components/tiptap-icons/text-color-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"
import { YoutubeIcon } from "@/components/tiptap-icons/youtube-icon"

// --- Hooks ---
import { useIsMobile } from "@/hooks/use-mobile"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

// --- Styles ---
import "@/components/tiptap-templates/unified/simple-editor.scss"
import "@/components/tiptap-templates/unified/readonly-editor.scss"
import "@/components/tiptap-ui/youtube-button/youtube-button.scss"

const MainToolbarContent = ({
  onHighlighterClick,
  onTextColorClick,
  onLinkClick,
  onYoutubeClick,
  isMobile,
}: {
  onHighlighterClick: () => void
  onTextColorClick: () => void
  onLinkClick: () => void
  onYoutubeClick: () => void
  isMobile: boolean
}) => {
  return (
    <>
      <Spacer />
      
      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
        <DetailsButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        {/* <MarkButton type="code" /> */}
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? (
          <TextColorPopover />
        ) : (
          <TextColorPopoverButton onClick={onTextColorClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
        {!isMobile ? (
          <YoutubeButton />
        ) : (
          <YoutubePopoverButton onClick={onYoutubeClick} />
        )}
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "textColor" | "link" | "youtube"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : type === "textColor" ? (
          <TextColorIcon className="tiptap-button-icon" />
        ) : type === "link" ? (
          <LinkIcon className="tiptap-button-icon" />
        ) : (
          <YoutubeIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : type === "textColor" ? (
      <TextColorPopoverContent />
    ) : type === "link" ? (
      <LinkContent />
    ) : (
      <YoutubePopoverContent />
    )}
  </>
)

export type EditorMode = "editable" | "readonly"

interface UnifiedEditorProps {
  mode: EditorMode
  // Props for editable mode
  onChange?: (content: string) => void
  initialContent?: string
  placeholder?: string
  // Props for readonly mode
  content?: string
  onContentRendered?: () => void
}

export function UnifiedEditor({ 
  mode = "editable",
  onChange, 
  initialContent,
  placeholder,
  content,
  onContentRendered 
}: UnifiedEditorProps) {
  const isMobile = useIsMobile()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<
    "main" | "highlighter" | "textColor" | "link" | "youtube"
  >("main")
  const toolbarRef = useRef<HTMLDivElement>(null)

  const isEditable = mode === "editable"
  const isReadonly = mode === "readonly"

  // Determine the content to use based on mode
  const editorContent = isEditable ? initialContent : content

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editable: isEditable,
    editorProps: {
      attributes: {
        ...(isEditable && {
          autocomplete: "off",
          autocorrect: "off",
          autocapitalize: "off",
          "aria-label": "Main content area, start typing to enter text.",
        }),
        class: isReadonly ? "simple-editor readonly-editor" : "simple-editor",
      },
    },
    onUpdate: ({ editor }) => {
      if (isEditable && onChange) {
        onChange(editor.getHTML())
      }
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: isReadonly, // Allow link clicks in readonly mode
          enableClickSelection: isEditable,
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
      ...(isEditable ? [Selection] : []),
      ...(isEditable && placeholder ? [Placeholder.configure({ 
        placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      })] : []),
      DetailsNode,
      Youtube.configure({
        controls: false,
        nocookie: true,
      }),
      // Only include ImageUploadNode in editable mode
      ...(isEditable ? [
        ImageUploadNode.configure({
          accept: "image/*",
          maxSize: MAX_FILE_SIZE,
          limit: 3,
          upload: handleImageUpload,
          onError: (error) => console.error("Upload failed:", error),
        })
      ] : []),
    ],
    content: editorContent || '',
  })

  // Debug: Kiểm tra editor extensions sau khi được tạo
  // useEffect(() => {
  //   if (editor) {
  //     console.log('Editor created with extensions:', editor.extensionManager.extensions.map(ext => ext.name))
  //     console.log('Editor is editable:', editor.isEditable)
  //     console.log('Editor content:', editor.getHTML())
  //     console.log('Editor isEmpty:', editor.isEmpty)
  //   }
  // }, [editor])

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  // Update content when initialContent/content changes
  useEffect(() => {
    const newContent = isEditable ? initialContent : content
    if (editor && newContent && newContent !== editor.getHTML()) {
      queueMicrotask(() => {
        editor.commands.setContent(newContent)
        // Call onContentRendered for readonly mode
        if (isReadonly && onContentRendered) {
          setTimeout(() => {
            onContentRendered()
          }, 100)
        }
      })
    }
  }, [editor, initialContent, content, isEditable, isReadonly, onContentRendered])

  // Call onContentRendered when readonly editor is first initialized
  useEffect(() => {
    if (editor && isReadonly && content && onContentRendered) {
      setTimeout(() => {
        onContentRendered()
      }, 100)
    }
  }, [editor, isReadonly, content, onContentRendered])

  return (
    <div className={isReadonly ? "simple-editor-wrapper readonly-wrapper" : "simple-editor-wrapper editable-wrapper"}>
      <EditorContext.Provider value={{ editor }}>
        {/* Only show toolbar in editable mode */}
        {isEditable && (
          <Toolbar
            ref={toolbarRef}
            style={{
              ...(isMobile
                ? {
                    bottom: `calc(100% - ${height - rect.y}px)`,
                  }
                : {}),
            }}
          >
            {mobileView === "main" ? (
              <MainToolbarContent
                onHighlighterClick={() => setMobileView("highlighter")}
                onTextColorClick={() => setMobileView("textColor")}
                onLinkClick={() => setMobileView("link")}
                onYoutubeClick={() => setMobileView("youtube")}
                isMobile={isMobile}
              />
            ) : (
              <MobileToolbarContent
                type={
                  mobileView === "highlighter"
                    ? "highlighter"
                    : mobileView === "textColor"
                    ? "textColor"
                    : mobileView === "link"
                    ? "link"
                    : "youtube"
                }
                onBack={() => setMobileView("main")}
              />
            )}
          </Toolbar>
        )}

        <EditorContent
          editor={editor}
          role="presentation"
          className={isReadonly ? "simple-editor-content readonly-content" : "simple-editor-content"}
        />
      </EditorContext.Provider>
    </div>
  )
}

// Export convenience components for backward compatibility
export const SimpleEditor = (props: { onChange?: (content: string) => void; initialContent?: string; placeholder?: string }) => (
  <UnifiedEditor mode="editable" {...props} />
)

export const ReadonlyEditor = (props: { content?: string; onContentRendered?: () => void }) => (
  <UnifiedEditor mode="readonly" {...props} />
)
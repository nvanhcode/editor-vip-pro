"use client"

import { useCallback } from "react"
import { type Editor } from "@tiptap/react"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { canSetTextColor } from "@/components/tiptap-ui/text-color-button/use-text-color"

export interface UseCustomTextColorConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Called when the custom color is applied.
   */
  onApplied?: (color: string) => void
}

export function useCustomTextColor(config: UseCustomTextColorConfig) {
  const { editor: providedEditor, onApplied } = config
  const { editor } = useTiptapEditor(providedEditor)
  
  const canSetCustomColor = canSetTextColor(editor)

  const handleCustomColorChange = useCallback(
    (color: string) => {
      if (!editor || !canSetCustomColor) return false

      // Clear any stored marks first
      if (editor.state.storedMarks) {
        const textStyleMarkType = editor.schema.marks.textStyle
        if (textStyleMarkType) {
          editor.view.dispatch(
            editor.state.tr.removeStoredMark(textStyleMarkType)
          )
        }
      }

      // Apply the custom color
      setTimeout(() => {
        const success = editor
          .chain()
          .focus()
          .setMark("textStyle", { color })
          .run()
        
        if (success) {
          onApplied?.(color)
        }
        
        return success
      }, 0)

      return true
    },
    [editor, canSetCustomColor, onApplied]
  )

  return {
    canSetCustomColor,
    handleCustomColorChange,
  }
}
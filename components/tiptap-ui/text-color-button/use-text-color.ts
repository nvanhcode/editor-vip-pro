"use client"

import { useCallback, useEffect, useState } from "react"
import { type Editor } from "@tiptap/react"
import { useHotkeys } from "react-hotkeys-hook"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useIsMobile } from "@/hooks/use-mobile"

// --- Lib ---
import {
  isMarkInSchema,
  isNodeTypeSelected,
} from "@/lib/tiptap-utils"

// --- Icons ---
import { TextColorIcon } from "@/components/tiptap-icons/text-color-icon"

export const TEXT_COLOR_SHORTCUT_KEY = "mod+shift+c"
export const TEXT_COLORS = [
  {
    label: "Default text",
    value: "var(--tt-text-color)",
  },
  {
    label: "Gray text",
    value: "var(--tt-color-text-gray)",
  },
  {
    label: "Brown text",
    value: "var(--tt-color-text-brown)",
  },
  {
    label: "Orange text",
    value: "var(--tt-color-text-orange)",
  },
  {
    label: "Yellow text",
    value: "var(--tt-color-text-yellow)",
  },
  {
    label: "Green text",
    value: "var(--tt-color-text-green)",
  },
  {
    label: "Blue text",
    value: "var(--tt-color-text-blue)",
  },
  {
    label: "Purple text",
    value: "var(--tt-color-text-purple)",
  },
  {
    label: "Pink text",
    value: "var(--tt-color-text-pink)",
  },
  {
    label: "Red text",
    value: "var(--tt-color-text-red)",
  },
]
export type TextColor = (typeof TEXT_COLORS)[number]

/**
 * Configuration for the text color functionality
 */
export interface UseTextColorConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The color to apply when toggling the text color.
   */
  textColor?: string
  /**
   * Optional label to display alongside the icon.
   */
  label?: string
  /**
   * Whether the button should hide when the mark is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Called when the text color is applied.
   */
  onApplied?: ({
    color,
    label,
  }: {
    color: string
    label: string
  }) => void
}

export function pickTextColorsByValue(values: string[]) {
  const colorMap = new Map(
    TEXT_COLORS.map((color) => [color.value, color])
  )
  return values
    .map((value) => colorMap.get(value))
    .filter((color): color is (typeof TEXT_COLORS)[number] => !!color)
}

/**
 * Checks if text color can be applied
 */
export function canSetTextColor(
  editor: Editor | null
): boolean {
  if (!editor || !editor.isEditable) return false

  if (
    !isMarkInSchema("textStyle", editor) ||
    isNodeTypeSelected(editor, ["image", "codeBlock"])
  )
    return false

  return editor.can().setMark("textStyle")
}

/**
 * Checks if text color is currently active
 */
export function isTextColorActive(
  editor: Editor | null,
  textColor?: string
): boolean {
  if (!editor || !editor.isEditable) return false

  return textColor
    ? editor.isActive("textStyle", { color: textColor })
    : editor.isActive("textStyle")
}

/**
 * Removes text color
 */
export function removeTextColor(
  editor: Editor | null
): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canSetTextColor(editor)) return false

  return editor.chain().focus().unsetMark("textStyle").run()
}

/**
 * Determines if the text color button should be shown
 */
export function shouldShowTextColorButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false

  if (!isMarkInSchema("textStyle", editor)) return false

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canSetTextColor(editor)
  }

  return true
}

export function useTextColor(config: UseTextColorConfig) {
  const {
    editor: providedEditor,
    label,
    textColor,
    hideWhenUnavailable = false,
    onApplied,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const canSetTextColorState = canSetTextColor(editor)
  const isActive = isTextColorActive(editor, textColor)

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowTextColorButton({ editor, hideWhenUnavailable }))
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable])

  const handleTextColor = useCallback(() => {
    if (!editor || !canSetTextColorState || !textColor || !label)
      return false

    if (editor.state.storedMarks) {
      const textStyleMarkType = editor.schema.marks.textStyle
      if (textStyleMarkType) {
        editor.view.dispatch(
          editor.state.tr.removeStoredMark(textStyleMarkType)
        )
      }
    }

    setTimeout(() => {
      const success = editor
        .chain()
        .focus()
        .setMark("textStyle", { color: textColor })
        .run()
      if (success) {
        onApplied?.({ color: textColor, label })
      }
      return success
    }, 0)

    return true
  }, [canSetTextColorState, textColor, editor, label, onApplied])

  const handleRemoveTextColor = useCallback(() => {
    const success = removeTextColor(editor)
    if (success) {
      onApplied?.({ color: "", label: "Remove text color" })
    }
    return success
  }, [editor, onApplied])

  useHotkeys(
    TEXT_COLOR_SHORTCUT_KEY,
    (event) => {
      event.preventDefault()
      handleTextColor()
    },
    {
      enabled: isVisible && canSetTextColorState,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    }
  )

  return {
    isVisible,
    isActive,
    handleTextColor,
    handleRemoveTextColor,
    canSetTextColor: canSetTextColorState,
    label: label || `Text color`,
    shortcutKeys: TEXT_COLOR_SHORTCUT_KEY,
    Icon: TextColorIcon,
  }
}
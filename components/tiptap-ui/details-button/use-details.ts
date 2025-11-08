import { useCallback } from "react"

// --- Tiptap React ---
import type { Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { DetailsIcon } from "@/components/tiptap-icons/details-icon"

export interface UseDetailsConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  
  /**
   * Whether to hide the button when details is unavailable.
   * @default false
   */
  hideWhenUnavailable?: boolean
  
  /**
   * Callback function to be called when details is toggled.
   */
  onToggled?: (isActive: boolean) => void
}

export const DETAILS_SHORTCUT_KEY = "Mod+Shift+D"

export function useDetails(config?: UseDetailsConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onToggled,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)

  const canToggle = !!(
    editor &&
    editor.can().chain().focus().setDetailsNode().run()
  )

  const isActive = !!(editor && editor.isActive("details"))

  const isVisible = !hideWhenUnavailable || canToggle

  const label = "Details"
  const shortcutKeys = DETAILS_SHORTCUT_KEY
  const Icon = DetailsIcon

  const handleToggle = useCallback(() => {
    if (!canToggle || !editor) return

    editor
      ?.chain()
      .focus()
      .setDetailsNode({ title: "Details" })
      .run()

    onToggled?.(isActive)
  }, [editor, canToggle, isActive, onToggled])

  return {
    isVisible,
    canToggle,
    isActive,
    handleToggle,
    label,
    shortcutKeys,
    Icon,
  }
}
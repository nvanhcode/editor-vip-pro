"use client"

import { forwardRef, useCallback } from "react"

// --- Tiptap UI Primitives ---
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Badge } from "@/components/tiptap-ui-primitive/badge"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Lib ---
import { parseShortcutKeys } from "@/lib/tiptap-utils"

// --- Tiptap UI ---
import type { UseImageUploadConfig } from "@/components/tiptap-ui/image-upload-button"
import {
  IMAGE_UPLOAD_SHORTCUT_KEY,
  useImageUpload,
} from "@/components/tiptap-ui/image-upload-button"

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"
import "./image-upload-dropdown.scss"

export type ImageLayoutType = "image-only" | "image-left-text-right" | "image-right-text-left"

export interface ImageUploadDropdownProps
  extends Omit<ButtonProps, "type">,
    UseImageUploadConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  /**
   * Optional show shortcut keys in the button.
   * @default false
   */
  showShortcut?: boolean
  /**
   * Optional custom icon component to render instead of the default.
   */
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  /**
   * Callback when layout type is selected
   */
  onLayoutSelect?: (layout: ImageLayoutType) => void
  /**
   * Whether to use portal for dropdown content
   */
  portal?: boolean
}

export function ImageShortcutBadge({
  shortcutKeys = IMAGE_UPLOAD_SHORTCUT_KEY,
}: {
  shortcutKeys?: string
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>
}

const layoutOptions = [
  {
    type: "image-only" as const,
    label: "Image Only",
    description: "Insert image without text",
  },
  {
    type: "image-left-text-right" as const,
    label: "Image Left, Text Right",
    description: "Image on left side with text on right",
  },
  {
    type: "image-right-text-left" as const,
    label: "Image Right, Text Left", 
    description: "Text on left side with image on right",
  },
]

/**
 * Dropdown component for uploading/inserting images with layout options in a Tiptap editor.
 */
export const ImageUploadDropdown = forwardRef<
  HTMLButtonElement,
  ImageUploadDropdownProps
>(
  (
    {
      editor: providedEditor,
      text,
      hideWhenUnavailable = false,
      onInserted,
      onLayoutSelect,
      showShortcut = false,
      icon: CustomIcon,
      children,
      portal = false,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const {
      isVisible,
      canInsert,
      handleImage,
      handleImageTextCombo,
      label,
      isActive,
      shortcutKeys,
      Icon,
    } = useImageUpload({
      editor,
      hideWhenUnavailable,
      onInserted,
    })

    const handleLayoutSelect = useCallback(
      (layout: ImageLayoutType) => {
        console.log('Selected layout:', layout);
        if (layout === "image-only") {
          // Use the existing image upload functionality
          console.log('Inserting regular image');
          handleImage()
        } else {
          // Use the new image-text combo functionality
          console.log('Inserting image-text combo with layout:', layout);
          handleImageTextCombo(layout)
          onLayoutSelect?.(layout)
        }
      },
      [handleImage, handleImageTextCombo, onLayoutSelect]
    )

    if (!isVisible) {
      return null
    }

    const RenderIcon = CustomIcon ?? Icon

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            data-style="ghost"
            data-active-state={isActive ? "on" : "off"}
            role="button"
            tabIndex={-1}
            disabled={!canInsert}
            data-disabled={!canInsert}
            aria-label={label}
            aria-pressed={isActive}
            tooltip={label}
            {...buttonProps}
            ref={ref}
          >
            {children ?? (
              <>
                <RenderIcon className="tiptap-button-icon" />
                {text && <span className="tiptap-button-text">{text}</span>}
                <ChevronDownIcon className="tiptap-button-icon" />
                {showShortcut && <ImageShortcutBadge shortcutKeys={shortcutKeys} />}
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent
          portal={portal}
          align="start"
          side="bottom"
          sideOffset={5}
          className="image-upload-dropdown-content"
        >
          {layoutOptions.map((option) => (
            <DropdownMenuItem
              key={option.type}
              onSelect={() => handleLayoutSelect(option.type)}
              className="image-upload-dropdown-item"
            >
              <button
                type="button"
                className="image-upload-option"
                aria-label={option.label}
              >
                <span className="option-icon" aria-hidden>
                  {/* simple graphic showing layout */}
                  {option.type === "image-only" ? (
                    <svg width="32" height="18" viewBox="0 0 32 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="1" width="30" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
                      <circle cx="9" cy="9" r="2" fill="currentColor" />
                    </svg>
                  ) : option.type === "image-left-text-right" ? (
                    <svg width="32" height="18" viewBox="0 0 32 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="1" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" />
                      <rect x="15" y="3" width="16" height="3" rx="1" fill="currentColor" />
                      <rect x="15" y="9" width="12" height="3" rx="1" fill="currentColor" opacity="0.6" />
                    </svg>
                  ) : (
                    <svg width="32" height="18" viewBox="0 0 32 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="19" y="1" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" />
                      <rect x="1" y="3" width="16" height="3" rx="1" fill="currentColor" />
                      <rect x="1" y="9" width="12" height="3" rx="1" fill="currentColor" opacity="0.6" />
                    </svg>
                  )}
                </span>

                <span className="option-meta">
                  <span className="option-title">{option.label}</span>
                  <span className="option-desc">{option.description}</span>
                </span>
              </button>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)

ImageUploadDropdown.displayName = "ImageUploadDropdown"
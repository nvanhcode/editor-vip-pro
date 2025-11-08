"use client"

import { forwardRef, useMemo, useRef, useState } from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useMenuNavigation } from "@/hooks/use-menu-navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { BanIcon } from "@/components/tiptap-icons/ban-icon"
import { TextColorIcon } from "@/components/tiptap-icons/text-color-icon"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/tiptap-ui-primitive/popover"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@/components/tiptap-ui-primitive/card"
import { ColorPicker } from "@/components/tiptap-ui-primitive/color-picker"

// --- Tiptap UI ---
import type {
  TextColor,
  UseTextColorConfig,
} from "@/components/tiptap-ui/text-color-button"
import {
  TextColorButton,
  pickTextColorsByValue,
  useTextColor,
  useCustomTextColor,
} from "@/components/tiptap-ui/text-color-button"

export interface TextColorPopoverContentProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Optional colors to use in the text color popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: TextColor[]
}

export interface TextColorPopoverProps
  extends Omit<ButtonProps, "type">,
    Pick<
      UseTextColorConfig,
      "editor" | "hideWhenUnavailable" | "onApplied"
    > {
  /**
   * Optional colors to use in the text color popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: TextColor[]
}

export const TextColorPopoverButton = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, children, ...props }, ref) => (
  <Button
    type="button"
    className={className}
    data-style="ghost"
    data-appearance="default"
    role="button"
    tabIndex={-1}
    aria-label="Set text color"
    tooltip="Text Color"
    ref={ref}
    {...props}
  >
    {children ?? <TextColorIcon className="tiptap-button-icon" />}
  </Button>
))

TextColorPopoverButton.displayName = "TextColorPopoverButton"

export function TextColorPopoverContent({
  editor,
  colors = pickTextColorsByValue([
    "var(--tt-color-text-red)",
    "var(--tt-color-text-orange)",
    "var(--tt-color-text-yellow)",
    "var(--tt-color-text-green)",
    "var(--tt-color-text-blue)",
    "var(--tt-color-text-purple)",
    "var(--tt-color-text-pink)",
    "var(--tt-color-text-brown)",
    "var(--tt-color-text-gray)",
  ]),
}: TextColorPopoverContentProps) {
  const { handleRemoveTextColor } = useTextColor({ editor })
  const { handleCustomColorChange, canSetCustomColor } = useCustomTextColor({ 
    editor,
    // onApplied: (color) => {
    //   console.log("Applied custom color:", color)
    // }
  })
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  const [customColor, setCustomColor] = useState("#000000")

  const menuItems = useMemo(
    () => [...colors, { label: "Custom color", value: "custom" }, { label: "Remove text color", value: "none" }],
    [colors]
  )

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item) => {
      if (!containerRef.current) return false
      const highlightedElement = containerRef.current.querySelector(
        '[data-highlighted="true"]'
      ) as HTMLElement
      if (highlightedElement) highlightedElement.click()
      if (item.value === "none") handleRemoveTextColor()
      else if (item.value === "custom") {
        // Custom color picker will handle this
        return true
      }
      return true
    },
    autoSelectFirstItem: false,
  })

  const handleCustomColorChangeInternal = (color: string) => {
    setCustomColor(color)
    handleCustomColorChange(color)
  }

  return (
    <Card
      ref={containerRef}
      tabIndex={0}
      style={isMobile ? { boxShadow: "none", border: 0 } : {}}
    >
      <CardBody style={isMobile ? { padding: 0 } : {}}>
        <CardItemGroup orientation="horizontal">
          <ButtonGroup orientation="horizontal">
            {colors.map((color, index) => (
              <TextColorButton
                key={color.value}
                editor={editor}
                textColor={color.value}
                tooltip={color.label}
                aria-label={`${color.label} text color`}
                tabIndex={index === selectedIndex ? 0 : -1}
                data-highlighted={selectedIndex === index}
              />
            ))}
          </ButtonGroup>
          <Separator />
          <ButtonGroup orientation="horizontal">
            <ColorPicker
              value={customColor}
              onChange={handleCustomColorChangeInternal}
              disabled={!canSetCustomColor}
              aria-label="Choose custom color"
              tooltip="Custom Color"
              tabIndex={selectedIndex === colors.length ? 0 : -1}
              data-highlighted={selectedIndex === colors.length}
            />
            <Button
              onClick={handleRemoveTextColor}
              aria-label="Remove text color"
              tooltip="Remove text color"
              tabIndex={selectedIndex === colors.length + 1 ? 0 : -1}
              type="button"
              role="menuitem"
              data-style="ghost"
              data-highlighted={selectedIndex === colors.length + 1}
            >
              <BanIcon className="tiptap-button-icon" />
            </Button>
          </ButtonGroup>
        </CardItemGroup>
      </CardBody>
    </Card>
  )
}

export function TextColorPopover({
  editor: providedEditor,
  colors = pickTextColorsByValue([
    "var(--tt-color-text-red)",
    "var(--tt-color-text-orange)",
    "var(--tt-color-text-yellow)",
    "var(--tt-color-text-green)",
    "var(--tt-color-text-blue)",
    "var(--tt-color-text-purple)",
    "var(--tt-color-text-pink)",
    "var(--tt-color-text-brown)",
    "var(--tt-color-text-gray)",
  ]),
  hideWhenUnavailable = false,
  onApplied,
  ...props
}: TextColorPopoverProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = useState(false)
  const { isVisible, canSetTextColor, isActive, label, Icon } =
    useTextColor({
      editor,
      hideWhenUnavailable,
      onApplied,
    })

  if (!isVisible) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <TextColorPopoverButton
          disabled={!canSetTextColor}
          data-active-state={isActive ? "on" : "off"}
          data-disabled={!canSetTextColor}
          aria-pressed={isActive}
          aria-label={label}
          tooltip={label}
          {...props}
        >
          <Icon className="tiptap-button-icon" />
        </TextColorPopoverButton>
      </PopoverTrigger>
      <PopoverContent aria-label="Text colors">
        <TextColorPopoverContent editor={editor} colors={colors} />
      </PopoverContent>
    </Popover>
  )
}

export default TextColorPopover
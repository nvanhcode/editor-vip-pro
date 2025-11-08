"use client"

import { forwardRef, useCallback, useId } from "react"
import { Button } from "@/components/tiptap-ui-primitive/button"

export interface ColorPickerProps {
  /**
   * Current color value
   */
  value?: string
  /**
   * Callback when color changes
   */
  onChange?: (color: string) => void
  /**
   * Label for accessibility
   */
  "aria-label"?: string
  /**
   * Tooltip text
   */
  tooltip?: string
  /**
   * Whether the picker is disabled
   */
  disabled?: boolean
  /**
   * Custom className
   */
  className?: string
  /**
   * Tab index for keyboard navigation
   */
  tabIndex?: number
  /**
   * Data attribute for highlighting
   */
  "data-highlighted"?: boolean
}

export const ColorPicker = forwardRef<HTMLButtonElement, ColorPickerProps>(
  (
    {
      value = "#000000",
      onChange,
      "aria-label": ariaLabel,
      tooltip,
      disabled = false,
      className,
      tabIndex,
      "data-highlighted": dataHighlighted,
      ...props
    },
    ref
  ) => {
    const colorInputId = useId()
    
    const handleColorChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = event.target.value
        onChange?.(newColor)
      },
      [onChange]
    )

    const handleButtonClick = useCallback(() => {
      if (!disabled) {
        // Trigger the hidden input
        const input = document.getElementById(colorInputId) as HTMLInputElement
        if (input) {
          input.click()
        }
      }
    }, [disabled, colorInputId])

    return (
      <>
        <Button
          type="button"
          data-style="ghost"
          data-appearance="default"
          role="button"
          tabIndex={tabIndex ?? -1}
          disabled={disabled}
          aria-label={ariaLabel || "Choose custom color"}
          tooltip={tooltip || "Custom Color"}
          onClick={handleButtonClick}
          className={className}
          data-highlighted={dataHighlighted}
          ref={ref}
          {...props}
        >
          <div
            className="color-picker-preview"
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "2px",
              backgroundColor: value,
              border: "1px solid var(--tt-border-color, #e5e5e5)",
              position: "relative",
            }}
          >
            {/* Rainbow gradient overlay to indicate it's a color picker */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)",
                opacity: 0.1,
                borderRadius: "1px",
                pointerEvents: "none",
              }}
            />
          </div>
        </Button>
        {/* Hidden color input */}
        <input
          id={colorInputId}
          type="color"
          value={value}
          onChange={handleColorChange}
          style={{
            position: "absolute",
            width: "0",
            height: "0",
            opacity: 0,
            pointerEvents: "none",
          }}
          aria-hidden="true"
          tabIndex={-1}
        />
      </>
    )
  }
)

ColorPicker.displayName = "ColorPicker"
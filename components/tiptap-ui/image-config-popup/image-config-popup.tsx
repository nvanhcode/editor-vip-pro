"use client"

import React, { useState } from "react"
import { CloseIcon } from "@/components/tiptap-icons/close-icon"
import { Button } from "@/components/tiptap-ui-primitive/button"
import "./image-config-popup.scss"

export interface ImageConfig {
  width?: string
  height?: string
  borderRadius?: string
}

export interface ImageConfigPopupProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: ImageConfig) => void
  initialConfig?: ImageConfig
  title?: string
}

export const ImageConfigPopup: React.FC<ImageConfigPopupProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig = {},
  title = "Image Configuration"
}) => {
  const [config, setConfig] = useState<ImageConfig>({
    width: initialConfig.width || "",
    height: initialConfig.height || "",
    borderRadius: initialConfig.borderRadius || ""
  })

  React.useEffect(() => {
    if (isOpen) {
      setConfig({
        width: initialConfig.width || "",
        height: initialConfig.height || "",
        borderRadius: initialConfig.borderRadius || ""
      })
    }
  }, [isOpen, initialConfig])

  const handleInputChange = (field: keyof ImageConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    onSave(config)
    onClose()
  }

  const handleReset = () => {
    setConfig({
      width: "",
      height: "",
      borderRadius: ""
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose()
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSave()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="image-config-popup-overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-config-title"
    >
      <div 
        className="image-config-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="image-config-header">
          <h3 id="image-config-title" className="image-config-title">
            {title}
          </h3>
          <Button
            type="button"
            data-style="ghost"
            onClick={onClose}
            className="image-config-close-btn"
            title="Close (Esc)"
          >
            <CloseIcon className="tiptap-button-icon" />
          </Button>
        </div>

        <div className="image-config-content">
          <div className="image-config-form">
            <div className="image-config-row">
              <div className="image-config-group">
                <label htmlFor="image-width" className="image-config-label">
                  Width
                </label>
                <input
                  id="image-width"
                  type="text"
                  className="image-config-input"
                  placeholder="e.g. 300px, 50%, auto"
                  value={config.width}
                  onChange={(e) => handleInputChange("width", e.target.value)}
                />
              </div>
              <div className="image-config-group">
                <label htmlFor="image-height" className="image-config-label">
                  Height
                </label>
                <input
                  id="image-height"
                  type="text"
                  className="image-config-input"
                  placeholder="e.g. 200px, auto"
                  value={config.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                />
              </div>
            </div>

            <div className="image-config-group">
              <label htmlFor="image-border-radius" className="image-config-label">
                Border Radius
              </label>
              <input
                id="image-border-radius"
                type="text"
                className="image-config-input"
                placeholder="e.g. 8px, 10%, 50%"
                value={config.borderRadius}
                onChange={(e) => handleInputChange("borderRadius", e.target.value)}
              />
            </div>

            <div className="image-config-presets">
              <span className="image-config-label">Quick presets:</span>
              <div className="image-config-preset-buttons">
                <Button
                  type="button"
                  data-style="ghost"
                  onClick={() => handleInputChange("borderRadius", "8px")}
                  className="image-config-preset-btn"
                >
                  Rounded
                </Button>
                <Button
                  type="button"
                  data-style="ghost"
                  onClick={() => handleInputChange("borderRadius", "50%")}
                  className="image-config-preset-btn"
                >
                  Circle
                </Button>
                <Button
                  type="button"
                  data-style="ghost"
                  onClick={() => handleInputChange("borderRadius", "0px")}
                  className="image-config-preset-btn"
                >
                  Sharp
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="image-config-footer">
          <Button
            type="button"
            data-style="ghost"
            onClick={handleReset}
            className="image-config-reset-btn"
          >
            Reset
          </Button>
          <div className="image-config-main-actions">
            <Button
              type="button"
              data-style="ghost"
              onClick={onClose}
              className="image-config-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-style="default"
              onClick={handleSave}
              className="image-config-save-btn"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageConfigPopup

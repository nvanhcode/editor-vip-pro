"use client"

import React, { useState, useCallback, useRef } from "react"
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react"
import type { NodeViewProps } from "@tiptap/react"

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"

interface DetailsNodeAttrs {
  title: string
  open: boolean
}

export function DetailsNodeComponent({ 
  node, 
  updateAttributes, 
  selected 
}: NodeViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempTitle, setTempTitle] = useState((node.attrs as DetailsNodeAttrs).title)
  const inputRef = useRef<HTMLInputElement>(null)

  const attrs = node.attrs as DetailsNodeAttrs

  const handleToggle = useCallback(() => {
    updateAttributes({ open: !attrs.open })
  }, [attrs.open, updateAttributes])

  const handleTitleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditing(true)
    setTempTitle(attrs.title)
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }, [attrs.title])

  const handleTitleSave = useCallback(() => {
    updateAttributes({ title: tempTitle })
    setIsEditing(false)
  }, [tempTitle, updateAttributes])

  const handleTitleCancel = useCallback(() => {
    setTempTitle(attrs.title)
    setIsEditing(false)
  }, [attrs.title])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTitleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleTitleCancel()
    }
  }, [handleTitleSave, handleTitleCancel])

  return (
    <NodeViewWrapper 
      className={`details-node ${selected ? 'selected' : ''}`}
      data-open={attrs.open}
    >
      <div className="details-summary" onClick={handleToggle}>
        <div className="details-icon">
          <ChevronDownIcon 
            className={`details-chevron ${attrs.open ? 'open' : ''}`}
          />
        </div>
        
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleKeyDown}
            className="details-title-input"
            placeholder="Enter details title..."
          />
        ) : (
          <div 
            className="details-title"
            onDoubleClick={handleTitleClick}
          >
            {attrs.title}
          </div>
        )}
      </div>
      
      <div className={`details-content ${attrs.open ? 'open' : 'closed'}`}>
        <div className="details-content-inner">
          <NodeViewContent />
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export default DetailsNodeComponent
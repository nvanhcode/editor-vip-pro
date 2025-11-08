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
  selected,
  editor
}: NodeViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const attrs = node.attrs as DetailsNodeAttrs
  
  // Use the actual title from attrs, unless we're editing
  const [tempTitle, setTempTitle] = useState(attrs.title)
  
  // Check if editor is in readonly mode
  const isReadonly = !editor?.isEditable

  const handleToggle = useCallback(() => {
    // Only toggle if we're not editing
    if (!isEditing) {
      updateAttributes({ open: !attrs.open })
    }
  }, [attrs.open, updateAttributes, isEditing])

  const handleSummaryClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    
    // In readonly mode, allow clicking anywhere in summary to toggle
    if (isReadonly) {
      e.preventDefault()
      e.stopPropagation()
      handleToggle()
      return
    }
    
    // In editable mode, don't toggle if clicking on title area or if editing
    if (isEditing || 
        target.classList.contains('details-title') || 
        target.closest('.details-title')) {
      return
    }
    
    e.preventDefault()
    e.stopPropagation()
    handleToggle()
  }, [handleToggle, isEditing, isReadonly])

  const handleTitleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isReadonly) {
      // In readonly mode, clicking title should toggle the details
      handleToggle()
    } else if (!isEditing) {
      // In editable mode, double-click should start editing
      setIsEditing(true)
      setTempTitle(attrs.title) // Always sync with current attrs
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 0)
    }
  }, [attrs.title, isEditing, isReadonly, handleToggle])

  const handleTitleSave = useCallback(() => {
    updateAttributes({ title: tempTitle })
    setIsEditing(false)
  }, [tempTitle, updateAttributes])

  const handleTitleCancel = useCallback(() => {
    setTempTitle(attrs.title)
    setIsEditing(false)
  }, [attrs.title])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation() // Prevent editor shortcuts when editing title
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTitleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleTitleCancel()
    }
  }, [handleTitleSave, handleTitleCancel])

  const handleInputClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleInputBlur = useCallback((e: React.FocusEvent) => {
    e.preventDefault()
    handleTitleSave()
  }, [handleTitleSave])

  return (
    <NodeViewWrapper 
      className={`details-node ${selected ? 'selected' : ''}`}
      data-open={attrs.open}
    >
      <div className="details-summary" onClick={handleSummaryClick}>
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
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            onClick={handleInputClick}
            className="details-title-input"
            placeholder="Enter details title..."
          />
        ) : (
          <div 
            className="details-title"
            onClick={isReadonly ? handleTitleClick : undefined}
            onDoubleClick={isReadonly ? undefined : handleTitleClick}
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
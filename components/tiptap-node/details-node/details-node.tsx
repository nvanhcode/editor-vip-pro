"use client"

import React, { useState, useCallback, useRef } from "react"
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react"
import type { NodeViewProps } from "@tiptap/react"

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"

interface DetailsNodeAttrs {
  title: string
  // open removed - managed via DOM only
}

export function DetailsNodeComponent({ 
  node, 
  updateAttributes, 
  selected,
  editor
}: NodeViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const attrs = node.attrs as DetailsNodeAttrs
  
  // Read open state directly from DOM element
  const [isOpen, setIsOpen] = useState(false)
  const [tempTitle, setTempTitle] = useState(attrs.title || "Details")
  
  // Check if editor is in readonly mode
  const isReadonly = !editor?.isEditable

  // Helper to read current state from DOM
  const readOpenStateFromDOM = useCallback(() => {
    if (containerRef.current) {
      const dataOpen = containerRef.current.getAttribute('data-open')
      return dataOpen === 'true'
    }
    return false
  }, [])

  // Helper to update DOM directly
  const updateDOMState = useCallback((open: boolean) => {
    if (containerRef.current) {
      containerRef.current.setAttribute('data-open', open ? 'true' : 'false')
      setIsOpen(open)
    }
  }, [])

  const handleToggle = useCallback(() => {
    if (!isEditing) {
      const currentState = readOpenStateFromDOM()
      const newState = !currentState
      updateDOMState(newState)
      
      // Optional: still update title attribute for persistence
      updateAttributes({ title: attrs.title })
    }
  }, [isEditing, readOpenStateFromDOM, updateDOMState, updateAttributes, attrs.title])

  const handleSummaryClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const target = e.target as HTMLElement
    
    if (isReadonly) {
      handleToggle()
      return
    }
    
    if (isEditing || 
        target.classList.contains('details-title') || 
        target.closest('.details-title') ||
        target.classList.contains('details-title-input') ||
        target.closest('.details-title-input')) {
      return
    }
    
    handleToggle()
  }, [handleToggle, isEditing, isReadonly])

  const handleTitleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isReadonly) {
      handleToggle()
      return
    }
    
    if (!isEditing) {
      setIsEditing(true)
      setTempTitle(attrs.title || "Details")
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 0)
    }
  }, [attrs.title, isEditing, isReadonly, handleToggle])

  const handleTitleSave = useCallback(() => {
    const newTitle = tempTitle.trim() || "Details"
    updateAttributes({ title: newTitle })
    setTempTitle(newTitle)
    setIsEditing(false)
  }, [tempTitle, updateAttributes])

  const handleTitleCancel = useCallback(() => {
    setTempTitle(attrs.title || "Details")
    setIsEditing(false)
  }, [attrs.title])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation()
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
      ref={containerRef}
      className={`details-node ${selected ? 'selected' : ''}`}
      data-open="false" // Always start closed
      data-title={attrs.title || "Details"}
    >
      <div className="details-summary" onClick={handleSummaryClick}>
        <div className="details-icon">
          <ChevronDownIcon 
            className={`details-chevron ${isOpen ? 'open' : ''}`}
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
            onClick={handleTitleClick}
          >
            {attrs.title || "Details"}
          </div>
        )}
      </div>
      
      <div className={`details-content ${isOpen ? 'open' : 'closed'}`}>
        <div className="details-content-inner">
          <NodeViewContent />
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export default DetailsNodeComponent
"use client"

import { UnifiedEditor } from "@/components/tiptap-templates/unified/unified-editor"
import { useEffect, useState, useRef, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useElementRect } from "@/hooks/use-element-rect"
import { useThrottledCallback } from "@/hooks/use-throttled-callback"
import type { IframeMessage, HeightData } from "@/types/iframe-messages"

function ToolbarEditorContent() {
  const searchParams = useSearchParams()
  const placeholder = searchParams.get('placeholder') || ''
  const isReadonly = searchParams.get('isReadOnly') === '1'
  
  const [content, setContent] = useState<string>('')
  const [initialContent, setInitialContent] = useState<string>('')
  const [currentEditContent, setCurrentEditContent] = useState<string>('') // Track content changes trong edit mode
  const [isContentLoaded, setIsContentLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [proseMirrorElement, setProseMirrorElement] = useState<Element | null>(null)
  
  // Điều kiện để thực hiện height tracking: readonly mode luôn thực hiện, editable mode cần isCalHeight = true
  const shouldTrackHeight = isReadonly;
  
  // Sử dụng hook để theo dõi kích thước của ProseMirror content
  const rect = useElementRect({ 
    element: proseMirrorElement,
    enabled: shouldTrackHeight && isContentLoaded && !!proseMirrorElement,
    throttleMs: 50,
    useResizeObserver: true
  })

  // Theo dõi container để tìm ProseMirror element
  const containerRect = useElementRect({ 
    element: containerRef as React.RefObject<Element>,
    enabled: shouldTrackHeight && isContentLoaded,
    throttleMs: 100,
    useResizeObserver: true
  })

  // Tìm ProseMirror element khi container thay đổi
  useEffect(() => {
    if (shouldTrackHeight && isContentLoaded && containerRef.current) {
      const findProseMirror = () => {
        const proseMirrorEl = containerRef.current?.querySelector('.ProseMirror')
        if (proseMirrorEl && proseMirrorEl !== proseMirrorElement) {
          setProseMirrorElement(proseMirrorEl)
        }
      }

      findProseMirror()
      const timer = setTimeout(findProseMirror, 100)
      
      return () => clearTimeout(timer)
    }
  }, [shouldTrackHeight, isContentLoaded, containerRect.height, proseMirrorElement])

  // Helper function để tính toán chính xác height của editor content
  const calculateTotalHeight = useCallback(() => {
    if (!shouldTrackHeight) return 0
    
    const containerEl = containerRef.current
    if (!containerEl) return 0

    const proseMirrorEl = containerEl.querySelector('.ProseMirror')
    const editorContentEl = containerEl.querySelector('.simple-editor-content')
    const editorWrapperEl = containerEl.querySelector('.simple-editor-wrapper')

    let contentHeight = 0
    let padding = 0

    if (proseMirrorEl) {
      contentHeight = proseMirrorEl.scrollHeight
    }

    if (editorContentEl) {
      const styles = window.getComputedStyle(editorContentEl)
      const paddingTop = parseInt(styles.paddingTop) || 0
      const paddingBottom = parseInt(styles.paddingBottom) || 0
      padding += paddingTop + paddingBottom
    }

    if (editorWrapperEl) {
      const styles = window.getComputedStyle(editorWrapperEl)
      const paddingTop = parseInt(styles.paddingTop) || 0
      const paddingBottom = parseInt(styles.paddingBottom) || 0
      padding += paddingTop + paddingBottom
    }

    const totalHeight = contentHeight + padding
    return totalHeight > 0 ? totalHeight : Math.max(containerEl.scrollHeight, rect.height)
  }, [shouldTrackHeight, rect.height])

  // Helper function để gửi height message
  const sendHeightMessage = useCallback((type: IframeMessage['type'], additionalData?: Record<string, unknown>) => {
    if (!shouldTrackHeight) return
    
    if (window.parent && window.parent !== window) {
      const containerEl = containerRef.current
      const totalHeight = calculateTotalHeight()
      const proseMirrorEl = containerEl?.querySelector('.ProseMirror')
      
      const heightData: HeightData = {
        height: totalHeight,
        rectHeight: rect.height,
        containerHeight: containerEl?.offsetHeight || 0,
        containerScrollHeight: containerEl?.scrollHeight || 0,
        documentScrollHeight: document.documentElement.scrollHeight,
        bodyScrollHeight: document.body.scrollHeight
      }

      const messageData: IframeMessage = {
        type,
        ...heightData,
        proseMirrorHeight: proseMirrorEl?.scrollHeight || 0,
        proseMirrorOffsetHeight: proseMirrorEl?.getBoundingClientRect().height || 0,
        hasProseMirrorElement: !!proseMirrorEl,
        ...additionalData
      } as IframeMessage

      window.parent.postMessage(messageData, '*')
    }
  }, [shouldTrackHeight, calculateTotalHeight, rect.height])

  // Throttled callback để gửi height message khi content thay đổi (tránh gọi quá nhiều lần)
  const throttledSendHeightMessage = useThrottledCallback(
    (type: IframeMessage['type'], additionalData?: Record<string, unknown>) => {
      sendHeightMessage(type, additionalData)
    },
    300 // 300ms throttle
  )

  // Gửi height ra bên ngoài khi có thay đổi
  useEffect(() => {
    if (shouldTrackHeight && isContentLoaded && rect.height > 0) {
      sendHeightMessage('HEIGHT_CHANGED', { 
        width: rect.width 
      })
    }
  }, [shouldTrackHeight, rect.height, rect.width, isContentLoaded, sendHeightMessage])

  // Handler cho thay đổi content (cho editable mode)
  const handleEditorChange = (newContent: string) => {
    // Update current content state để track changes
    setCurrentEditContent(newContent)
    
    // Gửi content change message ra parent
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'EDITOR_CONTENT_CHANGED',
        content: newContent
      }, '*')
    }
    
    // Nếu có height tracking, gửi height message với throttle để tránh spam
    if (shouldTrackHeight) {
      throttledSendHeightMessage('HEIGHT_CHANGED')
    }
  }

  // Callback khi content đã được render
  const handleContentRendered = useCallback(() => {
    if (!shouldTrackHeight) return
    
    const proseMirrorEl = containerRef.current?.querySelector('.ProseMirror')
    if (proseMirrorEl && proseMirrorEl !== proseMirrorElement) {
      setProseMirrorElement(proseMirrorEl)
    }
    
    setTimeout(() => {
      sendHeightMessage('CONTENT_RENDERED')
    }, 50)
  }, [shouldTrackHeight, sendHeightMessage, proseMirrorElement])

  useEffect(() => {
    // Gửi signal báo iframe đã sẵn sàng
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'IFRAME_READY'
      }, '*')
    }

    // Lắng nghe message từ iframe cha
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SET_INITIAL_CONTENT') {
        console.log('DEBUG _ SET INIT CONTENT', event.data.content);
        
        if (isReadonly) {
          setContent(event.data.content)
          setTimeout(() => {
            setIsContentLoaded(true)
          }, 100)
        } else {
          setInitialContent(event.data.content)
          setCurrentEditContent(event.data.content) // Set initial edit content ngay lập tức
          // Nếu editable mode có height tracking, cũng set isContentLoaded
          if (shouldTrackHeight) {
            setTimeout(() => {
              setIsContentLoaded(true)
            }, 100)
          }
        }
      } else if (event.data.type === 'REQUEST_HEIGHT' && shouldTrackHeight) {
        // Parent yêu cầu gửi lại height hiện tại
        setTimeout(() => {
          sendHeightMessage('HEIGHT_RESPONSE')
        }, 50)
      }
    }

    window.addEventListener('message', handleMessage)
    
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [isReadonly, shouldTrackHeight, sendHeightMessage])

  // Theo dõi thay đổi content để tính lại height
  useEffect(() => {
    if (shouldTrackHeight && isContentLoaded) {
      // Cho readonly mode, theo dõi content state
      // Cho editable mode với height tracking, theo dõi initialContent
      const contentToTrack = isReadonly ? content : initialContent
      
      if (contentToTrack) {
        const timer = setTimeout(() => {
          sendHeightMessage('CONTENT_HEIGHT_UPDATE')
        }, 200)

        return () => clearTimeout(timer)
      }
    }
  }, [shouldTrackHeight, content, initialContent, isContentLoaded, isReadonly, sendHeightMessage])

  // Theo dõi thay đổi current edit content để tính toán height (cho editable mode có height tracking)
  useEffect(() => {
    if (shouldTrackHeight && !isReadonly && currentEditContent && isContentLoaded) {
      // Sử dụng throttled callback để tránh spam height calculations
      const timer = setTimeout(() => {
        throttledSendHeightMessage('CONTENT_HEIGHT_UPDATE')
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [shouldTrackHeight, isReadonly, currentEditContent, isContentLoaded, throttledSendHeightMessage])

  // Mutation Observer để theo dõi thay đổi DOM
  useEffect(() => {
    if (!shouldTrackHeight || !isContentLoaded || !containerRef.current) return

    const observer = new MutationObserver(() => {
      const timer = setTimeout(() => {
        sendHeightMessage('DOM_MUTATED')
      }, 100)

      return () => clearTimeout(timer)
    })

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    })

    return () => {
      observer.disconnect()
    }
  }, [shouldTrackHeight, isContentLoaded, sendHeightMessage])

  // ProseMirror content observer - theo dõi cụ thể nội dung editor
  useEffect(() => {
    if (!shouldTrackHeight || !proseMirrorElement) return
    
    const observer = new MutationObserver(() => {
      const timer = setTimeout(() => {
        sendHeightMessage('CONTENT_HEIGHT_UPDATE')
      }, 50)

      return () => clearTimeout(timer)
    })

    observer.observe(proseMirrorElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true
    })

    return () => {
      observer.disconnect()
    }
  }, [shouldTrackHeight, proseMirrorElement, sendHeightMessage])

  // Render với style wrapper cho readonly mode hoặc editable mode với height tracking
  if (isReadonly || (!isReadonly && shouldTrackHeight)) {
    return (
      <div ref={containerRef} style={{ 
        minHeight: '100%', 
        width: '100%', 
        background: 'transparent',
        padding: 0,
        margin: 0
      }}>
        <UnifiedEditor 
          mode={isReadonly ? "readonly" : "editable"}
          content={isReadonly ? content : undefined}
          initialContent={!isReadonly ? initialContent : undefined}
          placeholder={!isReadonly ? placeholder : undefined}
          onChange={!isReadonly ? handleEditorChange : undefined}
          onContentRendered={handleContentRendered}
        />
      </div>
    )
  }

  // Render cho editable mode không cần height tracking
  return (
    <UnifiedEditor 
      mode="editable" 
      onChange={handleEditorChange} 
      initialContent={initialContent} 
      placeholder={placeholder} 
    />
  )
}

function LoadingFallback() {
  return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ToolbarEditorContent />
    </Suspense>
  )
}
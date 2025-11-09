"use client"

import { UnifiedEditor } from "@/components/tiptap-templates/unified/unified-editor"
import { useEffect, useState, useRef, useCallback } from "react"
import { useElementRect } from "@/hooks/use-element-rect"
import type { IframeMessage, HeightData } from "@/types/iframe-messages"

export default function Page() {
  const [content, setContent] = useState<string>('')
  const [isContentLoaded, setIsContentLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [proseMirrorElement, setProseMirrorElement] = useState<Element | null>(null)
  
  // Sử dụng hook để theo dõi kích thước của ProseMirror content
  const rect = useElementRect({ 
    element: proseMirrorElement,
    enabled: isContentLoaded && !!proseMirrorElement,
    throttleMs: 50,
    useResizeObserver: true
  })

  // Theo dõi container để tìm ProseMirror element
  const containerRect = useElementRect({ 
    element: containerRef as React.RefObject<Element>,
    enabled: isContentLoaded,
    throttleMs: 100,
    useResizeObserver: true
  })

  // Tìm ProseMirror element khi container thay đổi
  useEffect(() => {
    if (isContentLoaded && containerRef.current) {
      const findProseMirror = () => {
        const proseMirrorEl = containerRef.current?.querySelector('.ProseMirror')
        if (proseMirrorEl && proseMirrorEl !== proseMirrorElement) {
          // console.log('Found ProseMirror element:', proseMirrorEl)
          setProseMirrorElement(proseMirrorEl)
        }
      }

      // Tìm ngay lập tức
      findProseMirror()

      // Fallback: tìm sau delay nhỏ nếu chưa có
      const timer = setTimeout(findProseMirror, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isContentLoaded, containerRect.height, proseMirrorElement])

  // Helper function để tính toán chính xác height của editor content
  const calculateTotalHeight = useCallback(() => {
    const containerEl = containerRef.current
    if (!containerEl) return 0

    // Tìm ProseMirror element (nội dung thực của editor)
    const proseMirrorEl = containerEl.querySelector('.ProseMirror')
    const editorContentEl = containerEl.querySelector('.simple-editor-content')
    const editorWrapperEl = containerEl.querySelector('.simple-editor-wrapper')

    let contentHeight = 0
    let padding = 0

    if (proseMirrorEl) {
      // Lấy chiều cao thực của nội dung ProseMirror
      contentHeight = proseMirrorEl.scrollHeight
      // console.log('ProseMirror content height:', contentHeight)
    }

    if (editorContentEl) {
      // Tính padding của editor content
      const styles = window.getComputedStyle(editorContentEl)
      const paddingTop = parseInt(styles.paddingTop) || 0
      const paddingBottom = parseInt(styles.paddingBottom) || 0
      padding += paddingTop + paddingBottom
      // console.log('Editor content padding:', { paddingTop, paddingBottom })
    }

    if (editorWrapperEl) {
      // Tính padding của wrapper
      const styles = window.getComputedStyle(editorWrapperEl)
      const paddingTop = parseInt(styles.paddingTop) || 0
      const paddingBottom = parseInt(styles.paddingBottom) || 0
      padding += paddingTop + paddingBottom
      // console.log('Editor wrapper padding:', { paddingTop, paddingBottom })
    }

    // Chiều cao tổng = chiều cao content + padding
    const totalHeight = contentHeight + padding
    
    // console.log('Height calculation:', {
    //   contentHeight,
    //   padding,
    //   totalHeight,
    //   proseMirrorFound: !!proseMirrorEl,
    //   proseMirrorScrollHeight: proseMirrorEl?.scrollHeight,
    //   editorContentPadding: editorContentEl ? 'found' : 'not found',
    //   editorWrapperPadding: editorWrapperEl ? 'found' : 'not found',
    //   fallbackHeight: Math.max(containerEl.scrollHeight, rect.height)
    // })

    // Fallback nếu không tìm thấy ProseMirror element
    return totalHeight > 0 ? totalHeight : Math.max(containerEl.scrollHeight, rect.height)
  }, [rect.height])

  // Helper function để gửi height message
  const sendHeightMessage = useCallback((type: IframeMessage['type'], additionalData?: Record<string, unknown>) => {
    if (window.parent && window.parent !== window) {
      const containerEl = containerRef.current
      const totalHeight = calculateTotalHeight()
      const proseMirrorEl = containerEl?.querySelector('.ProseMirror')
      
      const heightData: HeightData = {
        height: totalHeight,
        rectHeight: rect.height, // Height từ ProseMirror element tracking
        containerHeight: containerEl?.offsetHeight || 0,
        containerScrollHeight: containerEl?.scrollHeight || 0,
        documentScrollHeight: document.documentElement.scrollHeight,
        bodyScrollHeight: document.body.scrollHeight
      }

      const messageData: IframeMessage = {
        type,
        ...heightData,
        // Thêm thông tin chi tiết về ProseMirror content
        proseMirrorHeight: proseMirrorEl?.scrollHeight || 0,
        proseMirrorOffsetHeight: proseMirrorEl?.getBoundingClientRect().height || 0,
        hasProseMirrorElement: !!proseMirrorEl,
        ...additionalData
      } as IframeMessage

      // console.log(`Sending ${type}:`, messageData)
      window.parent.postMessage(messageData, '*')
    }
  }, [calculateTotalHeight, rect.height])

  // Gửi height ra bên ngoài khi có thay đổi
  useEffect(() => {
    if (isContentLoaded && rect.height > 0) {
      sendHeightMessage('HEIGHT_CHANGED', { 
        width: rect.width 
      })
    }
  }, [rect.height, rect.width, isContentLoaded, sendHeightMessage])

  useEffect(() => {
    // console.log('Readonly iframe component mounted, sending ready signal...')
    
    // Gửi signal báo iframe đã sẵn sàng
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'IFRAME_READY'
      }, '*')
    }

    // Lắng nghe message từ iframe cha để nhận content
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SET_INITIAL_CONTENT') {
        // console.log('Setting readonly content:', event.data.content)
        setContent(event.data.content)
        
        // Delay để đảm bảo content đã render xong
        setTimeout(() => {
          setIsContentLoaded(true)
        }, 100)
      } else if (event.data.type === 'REQUEST_HEIGHT') {
        // Parent yêu cầu gửi lại height hiện tại
        // console.log('Parent requested current height')
        setTimeout(() => {
          sendHeightMessage('HEIGHT_RESPONSE')
        }, 50)
      }
    }

    window.addEventListener('message', handleMessage)
    
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [sendHeightMessage])

  // Theo dõi thay đổi content để tính lại height
  useEffect(() => {
    if (content && isContentLoaded) {
      // Delay nhỏ để đảm bảo DOM đã update
      const timer = setTimeout(() => {
        sendHeightMessage('CONTENT_HEIGHT_UPDATE')
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [content, isContentLoaded, sendHeightMessage])

  // Mutation Observer để theo dõi thay đổi DOM
  useEffect(() => {
    if (!isContentLoaded || !containerRef.current) return

    const observer = new MutationObserver(() => {
      // Debounce để tránh gọi quá nhiều lần
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
  }, [isContentLoaded, sendHeightMessage])

  // ProseMirror content observer - theo dõi cụ thể nội dung editor
  useEffect(() => {
    if (!proseMirrorElement) return

    // console.log('Setting up ProseMirror content observer...')
    
    const observer = new MutationObserver(() => {
      // console.log('ProseMirror content changed')
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
  }, [proseMirrorElement, sendHeightMessage])

  // Callback khi content đã được render
  const handleContentRendered = useCallback(() => {
    // console.log('Content rendered, finding ProseMirror element and calculating height...')
    
    // Đảm bảo ProseMirror element được tìm thấy
    const proseMirrorEl = containerRef.current?.querySelector('.ProseMirror')
    if (proseMirrorEl && proseMirrorEl !== proseMirrorElement) {
      setProseMirrorElement(proseMirrorEl)
    }
    
    // Delay nhỏ để đảm bảo DOM đã hoàn toàn update
    setTimeout(() => {
      sendHeightMessage('CONTENT_RENDERED')
    }, 50)
  }, [sendHeightMessage, proseMirrorElement])

  return (
    <div ref={containerRef} style={{ 
      minHeight: '100%', 
      width: '100%', 
      background: 'transparent',
      padding: 0,
      margin: 0
    }}>
      <UnifiedEditor 
        mode="readonly"
        content={content} 
        onContentRendered={handleContentRendered}
      />
    </div>
  )
}

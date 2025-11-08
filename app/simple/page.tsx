"use client"

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { useEffect, useState } from "react"

export default function Page() {
  const [initialContent, setInitialContent] = useState<string>('')

  useEffect(() => {
    console.log('Iframe component mounted, sending ready signal...')
    
    // Gửi signal báo iframe đã sẵn sàng
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'IFRAME_READY'
      }, '*')
    }

    // Lắng nghe message từ iframe cha
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SET_INITIAL_CONTENT') {
        console.log('Setting initial content:', event.data.content)
        setInitialContent(event.data.content)
      }
    }

    window.addEventListener('message', handleMessage)
    
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  const handleEditorChange = (content: string) => {
    // Gửi thông tin thay đổi cho iframe cha
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'EDITOR_CONTENT_CHANGED',
        content: content
      }, '*')
    }
  }

  return <SimpleEditor onChange={handleEditorChange} initialContent={initialContent} />
}

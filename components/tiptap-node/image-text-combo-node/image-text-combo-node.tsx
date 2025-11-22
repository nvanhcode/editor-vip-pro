"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import type { NodeViewProps } from "@tiptap/react"
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { CloseIcon } from "@/components/tiptap-icons/close-icon"
import { TrashIcon } from "@/components/tiptap-icons/trash-icon"
import "@/components/tiptap-node/image-text-combo-node/image-text-combo-node.scss"
import { focusNextNode, isValidPosition } from "@/lib/tiptap-utils"

interface FileItem {
  id: string
  file: File
  progress: number
  status: "uploading" | "success" | "error"
  url?: string
  abortController?: AbortController
}

interface UploadOptions {
  maxSize: number
  accept: string
  upload: (
    file: File,
    onProgress: (event: { progress: number }) => void,
    signal: AbortSignal
  ) => Promise<string>
  onSuccess?: (url: string) => void
  onError?: (error: Error) => void
}

function useFileUpload(options: UploadOptions) {
  const [fileItems, setFileItems] = useState<FileItem[]>([])

  const uploadFile = async (file: File): Promise<string | null> => {
    if (file.size > options.maxSize) {
      const error = new Error(
        `File size exceeds maximum allowed (${options.maxSize / 1024 / 1024}MB)`
      )
      options.onError?.(error)
      return null
    }

    const abortController = new AbortController()
    const fileId = crypto.randomUUID()

    const newFileItem: FileItem = {
      id: fileId,
      file,
      progress: 0,
      status: "uploading",
      abortController,
    }

    setFileItems((prev) => [...prev, newFileItem])

    try {
      if (!options.upload) {
        throw new Error("Upload function is not defined")
      }

      const url = await options.upload(
        file,
        (event: { progress: number }) => {
          setFileItems((prev) =>
            prev.map((item) =>
              item.id === fileId ? { ...item, progress: event.progress } : item
            )
          )
        },
        abortController.signal
      )

      if (!url) throw new Error("Upload failed: No URL returned")

      if (!abortController.signal.aborted) {
        setFileItems((prev) =>
          prev.map((item) =>
            item.id === fileId
              ? { ...item, status: "success", url, progress: 100 }
              : item
          )
        )
        options.onSuccess?.(url)
        return url
      }

      return null
    } catch (error) {
      if (!abortController.signal.aborted) {
        setFileItems((prev) =>
          prev.map((item) =>
            item.id === fileId
              ? { ...item, status: "error", progress: 0 }
              : item
          )
        )
        options.onError?.(
          error instanceof Error ? error : new Error("Upload failed")
        )
      }
      return null
    }
  }

  const removeFileItem = (fileId: string) => {
    setFileItems((prev) => {
      const fileToRemove = prev.find((item) => item.id === fileId)
      if (fileToRemove?.abortController) {
        fileToRemove.abortController.abort()
      }
      if (fileToRemove?.url) {
        URL.revokeObjectURL(fileToRemove.url)
      }
      return prev.filter((item) => item.id !== fileId)
    })
  }

  const clearAllFiles = () => {
    fileItems.forEach((item) => {
      if (item.abortController) {
        item.abortController.abort()
      }
      if (item.url) {
        URL.revokeObjectURL(item.url)
      }
    })
    setFileItems([])
  }

  return {
    fileItems,
    uploadFile,
    removeFileItem,
    clearAllFiles,
  }
}

const CloudUploadIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className="tiptap-image-upload-icon"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.1953 4.41771C10.3478 4.08499 9.43578 3.94949 8.5282 4.02147C7.62062 4.09345 6.74133 4.37102 5.95691 4.83316C5.1725 5.2953 4.50354 5.92989 4.00071 6.68886C3.49788 7.44783 3.17436 8.31128 3.05465 9.2138C2.93495 10.1163 3.0222 11.0343 3.3098 11.8981C3.5974 12.7619 4.07781 13.5489 4.71463 14.1995C5.10094 14.5942 5.09414 15.2274 4.69945 15.6137C4.30476 16 3.67163 15.9932 3.28532 15.5985C2.43622 14.731 1.79568 13.6816 1.41221 12.5299C1.02875 11.3781 0.91241 10.1542 1.07201 8.95084C1.23162 7.74748 1.66298 6.59621 2.33343 5.58425C3.00387 4.57229 3.89581 3.72617 4.9417 3.10998C5.98758 2.4938 7.15998 2.1237 8.37008 2.02773C9.58018 1.93176 10.7963 2.11243 11.9262 2.55605C13.0561 2.99968 14.0703 3.69462 14.8919 4.58825C15.5423 5.29573 16.0585 6.11304 16.4177 7.00002H17.4999C18.6799 6.99991 19.8288 7.37933 20.7766 8.08222C21.7245 8.78515 22.4212 9.7743 22.7637 10.9036C23.1062 12.0328 23.0765 13.2423 22.6788 14.3534C22.2812 15.4644 21.5367 16.4181 20.5554 17.0736C20.0962 17.3803 19.4752 17.2567 19.1684 16.7975C18.8617 16.3382 18.9853 15.7172 19.4445 15.4105C20.069 14.9934 20.5427 14.3865 20.7958 13.6794C21.0488 12.9724 21.0678 12.2027 20.8498 11.4841C20.6318 10.7655 20.1885 10.136 19.5853 9.6887C18.9821 9.24138 18.251 8.99993 17.5001 9.00002H15.71C15.2679 9.00002 14.8783 8.70973 14.7518 8.28611C14.4913 7.41374 14.0357 6.61208 13.4195 5.94186C12.8034 5.27164 12.0427 4.75043 11.1953 4.41771Z"
      fill="currentColor"
    />
    <path
      d="M11 14.4142V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V14.4142L15.2929 16.7071C15.6834 17.0976 16.3166 17.0976 16.7071 16.7071C17.0976 16.3166 17.0976 15.6834 16.7071 15.2929L12.7078 11.2936C12.7054 11.2912 12.703 11.2888 12.7005 11.2864C12.5208 11.1099 12.2746 11.0008 12.003 11L12 11L11.997 11C11.8625 11.0004 11.7343 11.0273 11.6172 11.0759C11.502 11.1236 11.3938 11.1937 11.2995 11.2864C11.297 11.2888 11.2946 11.2912 11.2922 11.2936L7.29289 15.2929C6.90237 15.6834 6.90237 16.3166 7.29289 16.7071C7.68342 17.0976 8.31658 17.0976 8.70711 16.7071L11 14.4142Z"
      fill="currentColor"
    />
  </svg>
)

interface ImageUploadAreaProps {
  onFileSelect: (file: File) => void
  accept: string
  maxSize: number
  isUploading: boolean
  progress: number
}

const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
  onFileSelect,
  accept,
  maxSize,
  isUploading,
  progress,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleClick = () => {
    if (!isUploading && inputRef.current) {
      inputRef.current.value = ""
      inputRef.current.click()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file)
    }
  }

  return (
    <div
      className={`image-text-combo-upload-area ${isDragOver ? 'drag-over' : ''} ${
        isUploading ? 'uploading' : ''
      }`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-image-upload-area
    >
      {isUploading && (
        <div className="upload-progress" style={{ width: `${progress}%` }} />
      )}
      <div className="upload-content">
        <CloudUploadIcon />
        <span className="upload-text">
          {isUploading ? `Uploading... ${progress}%` : 'Click or drag to upload image'}
        </span>
        <span className="upload-subtext">Max {maxSize / 1024 / 1024}MB</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}

interface TextAreaProps {
  isEditable: boolean
}

const TextArea: React.FC<TextAreaProps> = ({ isEditable }) => {
  if (!isEditable) {
    // For readonly mode, render the content as static
    return (
      <div className="image-text-combo-text-area readonly">
        <NodeViewContent className="text-content-display" />
      </div>
    )
  }

  // For editable mode, render as editable content
  return (
    <div className="image-text-combo-text-area">
      <NodeViewContent className="text-content-input" />
    </div>
  )
}

export const ImageTextComboNode: React.FC<NodeViewProps> = (props) => {
  const { node, editor, getPos } = props
  const { layout, accept, maxSize, imageUrl } = node.attrs
  const extension = props.extension
  const isEditable = editor.isEditable

  const uploadOptions: UploadOptions = {
    maxSize,
    accept,
    upload: extension.options.upload,
    onSuccess: extension.options.onSuccess,
    onError: extension.options.onError,
  }

  const { uploadFile, clearAllFiles } = useFileUpload(uploadOptions)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(imageUrl || '')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Sync imageUrl from node attrs when it changes
  useEffect(() => {
    setCurrentImageUrl(imageUrl || '')
  }, [imageUrl])

  const updateNodeAttrs = useCallback((attrs: Partial<typeof node.attrs>) => {
    const pos = getPos()
    if (isValidPosition(pos)) {
      editor.view.dispatch(
        editor.view.state.tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          ...attrs,
        })
      )
    }
  }, [node, getPos, editor])

  // Listen to content changes and store text content in attrs
  useEffect(() => {
    if (!isEditable) return

    const updateTextContent = () => {
      const pos = getPos()
      if (isValidPosition(pos)) {
        const nodeAfter = editor.state.doc.nodeAt(pos)
        if (nodeAfter) {
          // Extract text content from the node
          let textContent = ''
          nodeAfter.content.forEach((child) => {
            if (child.textContent) {
              textContent += child.textContent
            }
          })
          
          // Update the textContent attribute if it has changed
          if (textContent !== node.attrs.textContent) {
            updateNodeAttrs({ textContent })
          }
        }
      }
    }

    const handleTransaction = () => {
      setTimeout(updateTextContent, 0)
    }

    editor.on('transaction', handleTransaction)
    
    return () => {
      editor.off('transaction', handleTransaction)
    }
  }, [isEditable, editor, node.attrs.textContent, getPos, updateNodeAttrs])

  const handleFileSelect = async (file: File) => {
    if (!isEditable) return
    
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const url = await uploadFile(file)
      if (url) {
        setCurrentImageUrl(url)
        updateNodeAttrs({ imageUrl: url })
      }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      clearAllFiles()
    }
  }

  const handleRemoveImage = () => {
    if (!isEditable) return
    
    setCurrentImageUrl('')
    updateNodeAttrs({ imageUrl: '' })
  }

  const handleDeleteNode = () => {
    if (!isEditable) return
    
    const pos = getPos()
    if (isValidPosition(pos)) {
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .run()
      
      focusNextNode(editor)
    }
  }

  const isImageLeft = layout === "image-left-text-right"

  return (
    <NodeViewWrapper className={`image-text-combo-node layout-${layout} ${isEditable ? 'editable' : 'readonly'}`}>
      <div className="image-text-combo-container">
        <div className="image-text-combo-content">
          <div className={`image-section ${isImageLeft ? 'left' : 'right'}`}>
            {currentImageUrl ? (
              <div className="image-display">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentImageUrl} alt="Uploaded" className="uploaded-image" />
                {isEditable && (
                  <div className="image-actions">
                    <Button
                      type="button"
                      data-style="ghost"
                      onClick={handleRemoveImage}
                      title="Remove image"
                    >
                      <CloseIcon className="tiptap-button-icon" />
                    </Button>
                  </div>
                )}
              </div>
            ) : isEditable ? (
              <ImageUploadArea
                onFileSelect={handleFileSelect}
                accept={accept}
                maxSize={maxSize}
                isUploading={isUploading}
                progress={uploadProgress}
              />
            ) : null }
          </div>

          <div className={`text-section ${isImageLeft ? 'right' : 'left'}`}>
            <TextArea isEditable={isEditable} />
          </div>
        </div>

        {isEditable && (
          <div className="image-text-combo-actions">
            <Button
              type="button"
              data-style="ghost"
              onClick={handleDeleteNode}
              title="Delete this block"
            >
              <TrashIcon className="tiptap-button-icon" />
            </Button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
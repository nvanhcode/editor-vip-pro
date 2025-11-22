import { mergeAttributes, Node } from "@tiptap/react"
import { ReactNodeViewRenderer } from "@tiptap/react"
import type { NodeType } from "@tiptap/pm/model"
import { ImageTextComboNode as ImageTextComboNodeComponent } from "./image-text-combo-node"

export type UploadFunction = (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
) => Promise<string>

export type ImageTextLayout = "image-left-text-right" | "image-right-text-left"

export interface ImageTextComboNodeOptions {
  /**
   * The type of the node.
   * @default 'image'
   */
  type?: string | NodeType | undefined
  /**
   * Layout of image and text
   */
  layout: ImageTextLayout
  /**
   * Acceptable file types for upload.
   * @default 'image/*'
   */
  accept?: string
  /**
   * Maximum file size in bytes (0 for unlimited).
   * @default 0
   */
  maxSize?: number
  /**
   * Function to handle the upload process.
   */
  upload?: UploadFunction
  /**
   * Callback for upload errors.
   */
  onError?: (error: Error) => void
  /**
   * Callback for successful uploads.
   */
  onSuccess?: (url: string) => void
  /**
   * HTML attributes to add to the image element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes?: Record<string, unknown>
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    imageTextCombo: {
      setImageTextComboNode: (options?: ImageTextComboNodeOptions) => ReturnType
    }
  }
}

/**
 * A Tiptap node extension that creates an image-text combo component with responsive layouts.
 */
export const ImageTextComboNode = Node.create<ImageTextComboNodeOptions>({
  name: "imageTextCombo",

  group: "block",

  draggable: true,

  selectable: true,

  content: "block+", // Allow block content inside

  isolating: true, // Prevent content from leaking out

  addOptions() {
    return {
      type: "image",
      layout: "image-left-text-right",
      accept: "image/*",
      maxSize: 0,
      upload: undefined,
      onError: undefined,
      onSuccess: undefined,
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      layout: {
        default: this.options.layout,
        parseHTML: element => element.getAttribute('data-layout'),
        renderHTML: attributes => {
          if (!attributes.layout) {
            return {}
          }
          return {
            'data-layout': attributes.layout,
          }
        },
      },
      accept: {
        default: this.options.accept,
      },
      maxSize: {
        default: this.options.maxSize,
      },
      imageUrl: {
        default: null,
        parseHTML: element => element.getAttribute('data-image-url'),
        renderHTML: attributes => {
          if (!attributes.imageUrl) {
            return {}
          }
          return {
            'data-image-url': attributes.imageUrl,
          }
        },
      },
      textContent: {
        default: '',
        parseHTML: element => element.getAttribute('data-text-content'),
        renderHTML: attributes => {
          if (!attributes.textContent) {
            return {}
          }
          return {
            'data-text-content': attributes.textContent,
          }
        },
      },
      // Track initial content to populate editor
      hasInitialContent: {
        default: false,
      }
    }
  },

  parseHTML() {
    return [
      { 
        tag: 'div[data-type="image-text-combo"]',
        getAttrs: (element) => {
          if (typeof element === 'string') return false
          
          const imageUrl = element.getAttribute('data-image-url') || 
                           element.querySelector('img')?.getAttribute('src') || ''
          const layout = element.getAttribute('data-layout') || 'image-left-text-right'
          
          return {
            imageUrl,
            layout,
            accept: 'image/*',
            maxSize: 0,
          }
        },
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(
        { "data-type": "image-text-combo" }, 
        this.options.HTMLAttributes || {},
        HTMLAttributes
      ),
      0
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageTextComboNodeComponent)
  },

  addCommands() {
    return {
      setImageTextComboNode:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Enter your text here..."
                  }
                ]
              }
            ]
          })
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { selection } = editor.state
        const { nodeAfter } = selection.$from

        if (
          nodeAfter &&
          nodeAfter.type.name === "imageTextCombo" &&
          editor.isActive("imageTextCombo")
        ) {
          const nodeEl = editor.view.nodeDOM(selection.$from.pos)
          if (nodeEl && nodeEl instanceof HTMLElement) {
            // Focus on the upload area or text area
            const uploadArea = nodeEl.querySelector('[data-image-upload-area]')
            const textArea = nodeEl.querySelector('textarea')
            if (!nodeAfter.attrs.imageUrl && uploadArea && uploadArea instanceof HTMLElement) {
              uploadArea.click()
              return true
            } else if (textArea && textArea instanceof HTMLTextAreaElement) {
              textArea.focus()
              return true
            }
          }
        }
        return false
      },
    }
  },
})

export default ImageTextComboNode
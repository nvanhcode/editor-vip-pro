import { mergeAttributes, Node } from "@tiptap/react"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { DetailsNodeComponent } from "./details-node"

export interface DetailsNodeOptions {
  /**
   * HTML attributes to add to the details element.
   * @default {}
   * @example { class: 'foo' }
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLAttributes: Record<string, any>
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    details: {
      setDetailsNode: (options?: { title?: string }) => ReturnType
    }
  }
}

/**
 * Details node that ALWAYS starts closed.
 * Simple approach: override getInitialAttributes to force closed state.
 */
export const DetailsNode = Node.create<DetailsNodeOptions>({
  name: "details",

  group: "block",

  content: "block+",

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      title: {
        default: "Details",
        parseHTML: element => element.getAttribute('data-title') || "Details",
        renderHTML: attributes => ({
          'data-title': attributes.title || "Details",
        }),
      },
      // Remove open attribute completely - manage via DOM only
    }
  },

  parseHTML() {
    return [
      { 
        tag: 'div[data-type="details"]',
        getAttrs: (element) => {
          const el = element as HTMLElement
          return {
            title: el.getAttribute('data-title') || "Details"
            // No open attribute - pure DOM management
          }
        }
      }
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "div",
      mergeAttributes(
        { 
          "data-type": "details",
          "data-title": node.attrs.title || "Details",
          "data-open": "false" // Always render closed, let component manage DOM
        }, 
        this.options.HTMLAttributes, 
        HTMLAttributes
      ),
      0
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(DetailsNodeComponent)
  },

  addCommands() {
    return {
      setDetailsNode:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              title: options.title || "Details"
              // No open attribute - DOM manages state
            },
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Add your content here..."
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
      'Mod-Shift-d': () => this.editor.commands.setDetailsNode(),
    }
  },
})

export default DetailsNode
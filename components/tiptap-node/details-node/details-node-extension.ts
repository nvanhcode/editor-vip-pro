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
      setDetailsNode: (options?: { title?: string; open?: boolean }) => ReturnType
    }
  }
}

/**
 * A Tiptap node extension that creates a collapsible details/summary element.
 * Similar to HTML <details> tag with <summary> for title and content that can be toggled.
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
        parseHTML: element => element.getAttribute('data-title'),
        renderHTML: attributes => {
          if (!attributes.title) {
            return {}
          }
          return {
            'data-title': attributes.title,
          }
        },
      },
      open: {
        default: false,
        parseHTML: () => {
          // Always start closed regardless of saved state
          return false
        },
        renderHTML: attributes => {
          if (!attributes.open) {
            return {}
          }
          return {
            'data-open': attributes.open,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      { 
        tag: 'div[data-type="details"]',
      }
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "div",
      mergeAttributes(
        { 
          "data-type": "details",
          "data-title": node.attrs.title,
          "data-open": node.attrs.open
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
              title: options.title || "Details",
              open: options.open || false
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
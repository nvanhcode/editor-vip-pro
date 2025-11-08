// Type definitions cho các message giữa iframe và parent

export interface IframeReadyMessage {
  type: 'IFRAME_READY'
}

export interface SetInitialContentMessage {
  type: 'SET_INITIAL_CONTENT'
  content: string
}

export interface HeightChangedMessage {
  type: 'HEIGHT_CHANGED'
  height: number
  width: number
  rectHeight: number
  containerHeight: number
  containerScrollHeight: number
  documentScrollHeight: number
  bodyScrollHeight: number
}

export interface ContentHeightUpdateMessage {
  type: 'CONTENT_HEIGHT_UPDATE'
  height: number
  rectHeight: number
  containerHeight: number
  containerScrollHeight: number
  documentScrollHeight: number
  bodyScrollHeight: number
}

export interface ContentRenderedMessage {
  type: 'CONTENT_RENDERED'
  height: number
  rectHeight: number
  containerHeight: number
  containerScrollHeight: number
  documentScrollHeight: number
  bodyScrollHeight: number
}

export interface DomMutatedMessage {
  type: 'DOM_MUTATED'
  height: number
  rectHeight: number
  containerHeight: number
  containerScrollHeight: number
  documentScrollHeight: number
  bodyScrollHeight: number
}

export interface RequestHeightMessage {
  type: 'REQUEST_HEIGHT'
}

export interface HeightResponseMessage {
  type: 'HEIGHT_RESPONSE'
  height: number
  rectHeight: number
  containerHeight: number
  containerScrollHeight: number
  documentScrollHeight: number
  bodyScrollHeight: number
}

export type IframeMessage = 
  | IframeReadyMessage
  | SetInitialContentMessage
  | HeightChangedMessage
  | ContentHeightUpdateMessage
  | ContentRenderedMessage
  | DomMutatedMessage
  | RequestHeightMessage
  | HeightResponseMessage

// Helper type để extract message data theo type
export type MessageDataByType<T extends IframeMessage['type']> = Extract<IframeMessage, { type: T }>

// Convenience types cho parent component
export interface HeightData {
  height: number
  rectHeight: number
  containerHeight: number
  containerScrollHeight: number
  documentScrollHeight: number
  bodyScrollHeight: number
  // Thông tin chi tiết về ProseMirror content
  proseMirrorHeight?: number
  proseMirrorOffsetHeight?: number
  hasProseMirrorElement?: boolean
}

export interface IframeHeightCalculator {
  requestHeight: () => void
  onHeightChange: (callback: (data: HeightData) => void) => () => void
}
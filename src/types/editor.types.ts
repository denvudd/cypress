export enum SocketEditorEvent {
  CreateRoom = "create-room",
  SendChanges = "send-changes",
  ReceiveChanges = "receive-changes",
  TextChange = "text-change",
  SelectionChange = "selection-change",
  ReceiveCursorMove = "receive-cursor-move",
  SendCursorMove = "send-cursor-move",
}

export type EditorRange = { index: number; length: number } | null;

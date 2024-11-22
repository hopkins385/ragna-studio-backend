export enum ChatEvent {
  STREAM_FINISHED = 'chat.stream.finished',
  STREAM_ERROR = 'chat.stream.error',
  STREAM_STOP_LENGTH = 'chat.stream.length',
  FIRST_USERMESSAGE = 'chat.firstUserMessage',
  TOOL_START_CALL = 'chat.tool.startcall',
  TOOL_END_CALL = 'chat.tool.endcall',
}

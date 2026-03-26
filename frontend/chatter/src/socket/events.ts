export const SOCKET_EVENTS = {
  // connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // presence
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',

  // conversations
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',
  CONVERSATION_CREATED: 'conversation_created',

  // messages
  MESSAGE_RECEIVED: 'message_received',
  MESSAGE_UPDATED: 'message_updated',
  MESSAGE_DELETED: 'message_deleted',
  MESSAGE_DELIVERED: 'message_delivered',
  MESSAGE_READ: 'message_read',
  MARK_READ: 'mark_read',

  // typing
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  USER_TYPING: 'user_typing',
  USER_STOPPED_TYPING: 'user_stopped_typing',

  // calls
  CALL_INCOMING: 'call_incoming',
  CALL_ACCEPTED: 'call_accepted',
  CALL_REJECTED: 'call_rejected',
  CALL_ENDED: 'call_ended',
  WEBRTC_OFFER: 'webrtc_offer',
  WEBRTC_ANSWER: 'webrtc_answer',
  ICE_CANDIDATE: 'ice_candidate',
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

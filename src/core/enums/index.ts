export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  PENDING = 'pending',
}

export enum WorkspaceRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}

export enum ChannelType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  DIRECT = 'direct',
}

export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
  SYSTEM = 'system',
}

export enum AttachmentType {
  IMAGE = 'image',
  FILE = 'file',
  LINK = 'link',
}

export enum NotificationType {
  MESSAGE = 'message',
  MENTION = 'mention',
  REACTION = 'reaction',
  THREAD = 'thread',
  CHANNEL = 'channel',
  WORKSPACE = 'workspace',
}

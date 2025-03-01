export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
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

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  GITHUB = 'github',
}

export enum LoginStatus {
  SUCCESS = 'success',
  INVALID_CREDENTIALS = 'invalid_credentials',
  USER_NOT_FOUND = 'user_not_found',
  USER_BLOCKED = 'user_blocked',
}

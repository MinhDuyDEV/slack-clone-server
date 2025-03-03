import { IBaseEntity } from './base.interface';
import { AttachmentType } from 'src/core/enums';
export interface IAttachment extends IBaseEntity {
  type: AttachmentType;
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
  messageId: string;
}

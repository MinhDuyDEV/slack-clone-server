import { AttachmentType } from 'src/core/enums';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Xác định loại tệp đính kèm dựa trên MIME type
 * @param mimeType MIME type của tệp
 * @returns Loại tệp đính kèm
 */
export function getAttachmentType(mimeType: string): AttachmentType {
  if (mimeType.startsWith('image/')) {
    return AttachmentType.IMAGE;
  } else if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
    return AttachmentType.FILE;
  } else if (
    mimeType === 'application/pdf' ||
    mimeType.includes('document') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('presentation')
  ) {
    return AttachmentType.FILE;
  } else {
    return AttachmentType.LINK;
  }
}

/**
 * Tạo tên tệp duy nhất để tránh trùng lặp
 * @param originalName Tên tệp gốc
 * @returns Tên tệp duy nhất
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);

  return `${baseName}-${timestamp}-${randomString}${extension}`;
}

/**
 * Kiểm tra xem tệp có phải là hình ảnh không
 * @param mimeType MIME type của tệp
 * @returns true nếu tệp là hình ảnh
 */
export function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Tạo đường dẫn lưu trữ tệp dựa trên loại và ID của workspace
 * @param workspaceId ID của workspace
 * @param type Loại tệp đính kèm
 * @returns Đường dẫn lưu trữ tệp
 */
export function getStoragePath(
  workspaceId: string,
  type: AttachmentType,
): string {
  const baseDir = 'uploads';

  if (type === AttachmentType.IMAGE) {
    return path.join(baseDir, workspaceId, 'images');
  } else {
    return path.join(baseDir, workspaceId, 'files');
  }
}

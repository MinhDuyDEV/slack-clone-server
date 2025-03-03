/**
 * Phân tích nội dung tin nhắn để tìm các đề cập (mentions)
 * @param content Nội dung tin nhắn
 * @returns Đối tượng chứa thông tin về các đề cập
 */
export function parseMentions(content: string): {
  users: string[];
  channels: string[];
  everyone: boolean;
} {
  const mentions = {
    users: [],
    channels: [],
    everyone: false,
  };

  // Tìm các đề cập người dùng (@username)
  const userMentions = content.match(/@([a-zA-Z0-9_-]+)/g);
  if (userMentions) {
    mentions.users = userMentions.map((mention) => mention.substring(1));
  }

  // Tìm các đề cập kênh (#channel)
  const channelMentions = content.match(/#([a-zA-Z0-9_-]+)/g);
  if (channelMentions) {
    mentions.channels = channelMentions.map((mention) => mention.substring(1));
  }

  // Kiểm tra đề cập @everyone
  if (content.includes('@everyone')) {
    mentions.everyone = true;
  }

  return mentions;
}

/**
 * Định dạng nội dung tin nhắn để hiển thị
 * @param content Nội dung tin nhắn gốc
 * @returns Nội dung đã được định dạng
 */
export function formatMessageContent(content: string): string {
  // Thay thế URL bằng liên kết
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  let formattedContent = content.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank">${url}</a>`,
  );

  // Định dạng markdown cơ bản
  // Bold
  formattedContent = formattedContent.replace(
    /\*\*(.*?)\*\*/g,
    '<strong>$1</strong>',
  );

  // Italic
  formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Code
  formattedContent = formattedContent.replace(/`(.*?)`/g, '<code>$1</code>');

  return formattedContent;
}

/**
 * Kiểm tra xem tin nhắn có chứa từ khóa không
 * @param content Nội dung tin nhắn
 * @param keywords Danh sách từ khóa cần kiểm tra
 * @returns true nếu tin nhắn chứa ít nhất một từ khóa
 */
export function containsKeywords(content: string, keywords: string[]): boolean {
  if (!keywords || keywords.length === 0) {
    return false;
  }

  const lowerContent = content.toLowerCase();
  return keywords.some((keyword) =>
    lowerContent.includes(keyword.toLowerCase()),
  );
}

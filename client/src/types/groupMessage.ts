export type GroupMessage = {
  chatId: number;
  groupId: number;
  authorId: number;
  authorName: string;
  authorProfileImage: string | null;
  content: string;
  createdAt: string;
};

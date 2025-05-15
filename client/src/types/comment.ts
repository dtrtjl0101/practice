export type Comment = {
  commentId: number;
  authorId: string;
  authorName: string;
  authorProfileImageURL: string;
  content: string;
  createdAt: string;
  modifiedAt?: string;
  isEdited: boolean;
  isDeleted: boolean;
  stance?: "agree" | "disagree" | "neutral";
  parentId?: number;
  replies?: string[];
};

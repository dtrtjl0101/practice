export type Comment = {
  commentId: number;
  authorId: number;
  authorName: string;
  authorProfileImageURL: string;
  content: string;
  createdAt: string;
  modifiedAt?: string;
  isEdited: boolean;
  isDeleted: boolean;
  stance?: StanceOptions;
  parentId?: number;
  replies: Comment[];
};

export type StanceOptions = "AGREE" | "DISAGREE" | "NEUTRAL";

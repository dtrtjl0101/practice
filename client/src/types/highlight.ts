export type Highlight = {
  id: number;
  bookId: number;
  authorId: number;
  authorName: string;
  authorProfileImageURL: string;
  spine: string;
  cfi: string;
  memo: string;
  activityId?: number;
  highlightContent: string;
};

export type HighlightReactionType =
  | "GREAT"
  | "HEART"
  | "SMILE"
  | "CLAP"
  | "SAD"
  | "ANGRY"
  | "SURPRISED";

export type HighlightReaction = {
  id: number;
  authorId: number;
  authorName: string;
  reactionType: HighlightReactionType;
  emoji: string;
  commentId: number;
  createdAt: string;
};

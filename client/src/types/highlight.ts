import { DiscussionSummary } from "./discussion";

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
  linkedDiscussions: DiscussionSummary[];
  highlightContent: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverImageURL: string;
  groupId?: number;
  groupName?: string;
  groupImageURL?: string;
  createdAt: string;
};

export type HighlightReactionType =
  | "GREAT"
  | "HEART"
  | "SMILE"
  | "CLAP"
  | "SAD"
  | "ANGRY"
  | "SURPRISED";
export const highlightReactionTypes: HighlightReactionType[] = [
  "GREAT",
  "HEART",
  "SMILE",
  "CLAP",
  "SAD",
  "ANGRY",
  "SURPRISED",
];

export function getEmojiFromReactionType(
  reactionType: HighlightReactionType
): string {
  switch (reactionType) {
    case "GREAT": {
      return "👍";
    }
    case "HEART": {
      return "❤️";
    }
    case "SMILE": {
      return "😊";
    }
    case "CLAP": {
      return "👏";
    }
    case "SAD": {
      return "😢";
    }
    case "ANGRY": {
      return "😡";
    }
    case "SURPRISED": {
      return "😲";
    }
    default: {
      throw new Error("Unknown reaction type");
    }
  }
}

export type HighlightReaction = {
  id: number;
  authorId: number;
  authorName: string;
  reactionType: HighlightReactionType;
  emoji: string;
  commentId: number;
  createdAt: string;
};

export type HighlightComment = {
  id: number;
  authorId: number;
  authorName: string;
  authorProfileImageURL: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  replies: HighlightComment[];
  reactions: HighlightReaction[];
};

export type HighlightSummary = {
  id: number;
  bookId: number;
  authorId: number;
  authorName: string;
  authorProfileImageURL: string;
  spine: string;
  cfi: string;
  memo: string;
  highlightContent: string;
};

export type HighlightNotification = {
  id: number;
  authorId: number;
  authorName: string;
  authorProfileImageURL: string;
  spine: string;
  cfi: string;
  createdAt: string;
};

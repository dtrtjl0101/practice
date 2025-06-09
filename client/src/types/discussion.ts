import { HighlightSummary } from "./highlight";

export type Discussion = {
  discussionId: number; // 자동으로 생성
  activityId: number; // url에서 가져옴
  title: string;
  content: string;
  authorId: number; // header에서 자동으로 기록
  authorName: string; // header에서 자동으로 기록
  authorProfileImage: string; // header에서 자동으로 기록
  createdAt: string; // 서버에서 자동으로 기록
  modifiedAt?: string; // 서버에서 자동으로 기록
  commentCount: number; // 서버에서 자동으로 기록
  isDebate: boolean;
  comments: Comment[]; // 서버에서 자동으로 기록
  linkedHighlights: HighlightSummary[]; // 서버에서 자동으로 기록
  agreeCount?: number;
  disagreeCount?: number;
  neutralCount?: number;
};

export type DiscussionSummary = {
  discussionId: number;
  activityId: number;
  title: string;
  authorId: number;
  authorName: string;
};

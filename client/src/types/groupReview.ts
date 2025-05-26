export type GroupReview = {
  id: number;
  authorId: number;
  authorName: string;
  authorProfileImage?: string;
  content: string;
  tags: string[];
  activityId: number;
  activityTitle: string;
  createdAt: string;
  modifiedAt: string;
};

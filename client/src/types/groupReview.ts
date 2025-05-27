export type GroupReview = {
  reviewId: number;
  groupId: number;
  groupName: string;
  content: string;
  authorId: number;
  authorNickname: string;
  authorProfileImageURL?: string;
  tags: string[];
  createdAt: string;
  modifiedAt: string;
};

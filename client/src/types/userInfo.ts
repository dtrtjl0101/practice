export type UserProfile = {
  memberId?: number;
  email?: string;
  /** @format int64 */
  userId?: number;
  nickname?: string;
  profileImageURL?: string;
  role?: string;
  /** @format int64 */
  recentGroupId?: number;
  recentGroupName?: string;
  recentGroupImageURL?: string;
  /** @format int64 */
  recentActivityId?: number;
  recentActivityBookTitle?: string;
  recentActivityBookAuthor?: string;
  recentActivityBookCoverImageURL?: string;
  firstPaymentBenefit?: boolean;
  /** @format date-time */
  createdAt?: string;
};

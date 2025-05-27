/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface UserJoinRequest {
  email: string;
  password: string;
  nickname: string;
  /** @format binary */
  profileImage?: File;
  verificationCode: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseLoginResponse {
  isSuccessful?: boolean;
  data?: LoginResponse;
}

export interface LoginResponse {
  /**
   * 회원 고유 ID
   * @format int64
   * @example 1
   */
  memberId: number;
  /**
   * 회원 이메일
   * @example "user@example.com"
   */
  email: string;
  /**
   * 일반 사용자 ID
   * @format int64
   * @example 1
   */
  userId?: number;
  /**
   * 닉네임
   * @example "booklover"
   */
  nickname?: string;
  /**
   * 출판사 ID
   * @format int64
   * @example 1
   */
  publisherId?: number;
  /**
   * 출판사 이름
   * @example "문학과지성사"
   */
  publisherName?: string;
  /**
   * 프로필 이미지 URL
   * @example "https://cdn.example.com/images/profile1.png"
   */
  profileImageURL?: string;
  /**
   * 회원 역할
   * @example "ROLE_USER"
   */
  role: "ROLE_USER" | "ROLE_PUBLISHER" | "ROLE_ADMIN";
  /**
   * Refresh Token (재발급용)
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  refreshToken: string;
  /**
   * Access Token (API 인증용)
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  accessToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseRefreshTokenResponse {
  isSuccessful?: boolean;
  data?: RefreshTokenResponse;
}

export interface RefreshTokenResponse {
  refreshToken?: string;
  accessToken?: string;
}

export interface ReadingProgressRequest {
  cfi?: string;
  /** @format int64 */
  percentage?: number;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseVoid {
  isSuccessful?: boolean;
  data?: object;
}

export interface PublisherJoinRequest {
  publisherName: string;
  email: string;
  password: string;
  /** @format binary */
  profileImage?: File;
  verificationCode: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface HighlightPostRequest {
  /** @format int64 */
  bookId?: number;
  spine?: string;
  cfi?: string;
  /** @format int64 */
  activityId?: number;
  memo?: string;
  highlightContent?: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseHighlightPostResponse {
  isSuccessful?: boolean;
  data?: HighlightPostResponse;
}

export interface HighlightPostResponse {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  bookId?: number;
  spine?: string;
  cfi?: string;
  memo?: string;
  /** @format int64 */
  activityId?: number;
  highlightContent?: string;
}

export interface HighlightReactionRequest {
  /** @format int64 */
  commentId?: number;
  reactionType?:
    | "GREAT"
    | "HEART"
    | "SMILE"
    | "CLAP"
    | "SAD"
    | "ANGRY"
    | "SURPRISED";
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseHighlightReactionResponse {
  isSuccessful?: boolean;
  data?: HighlightReactionResponse;
}

export interface HighlightReactionResponse {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  authorId?: number;
  authorName?: string;
  reactionType?:
    | "GREAT"
    | "HEART"
    | "SMILE"
    | "CLAP"
    | "SAD"
    | "ANGRY"
    | "SURPRISED";
  emoji?: string;
  /** @format int64 */
  commentId?: number;
  /** @format date-time */
  createdAt?: string;
}

export interface HighlightCommentRequest {
  content?: string;
  /** @format int64 */
  parentId?: number;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseHighlightCommentResponse {
  isSuccessful?: boolean;
  data?: HighlightCommentResponse;
}

export interface HighlightCommentResponse {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  authorId?: number;
  authorName?: string;
  authorProfileImageURL?: string;
  content?: string;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
  replies?: HighlightCommentResponse[];
  reactions?: HighlightReactionResponse[];
}

export interface GroupPostRequest {
  name: string;
  description: string;
  tags?: string[];
  /** @format binary */
  groupImage?: File;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseGroupPostResponse {
  isSuccessful?: boolean;
  data?: GroupPostResponse;
}

export interface GroupPostResponse {
  /** @format int64 */
  groupId?: number;
  name?: string;
  description?: string;
  groupImageURL?: string;
  tags?: string[];
}

export interface GroupReviewPostRequest {
  /** @format int64 */
  activityId?: number;
  content?: string;
  tags?: (
    | "FUNNY"
    | "CALM"
    | "PASSIONATE"
    | "HEARTWARMING"
    | "DEEP_THOUGHT"
    | "INSIGHTFUL"
    | "DIVERSE_OPINIONS"
    | "TALKATIVE"
    | "GOOD_LISTENERS"
    | "STRUCTURED"
    | "CASUAL"
    | "WELL_MODERATED"
  )[];
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseGroupReviewFetchResponse {
  isSuccessful?: boolean;
  data?: GroupReviewFetchResponse;
}

export interface GroupReviewFetchResponse {
  /** @format int64 */
  reviewId?: number;
  /** @format int64 */
  groupId?: number;
  groupName?: string;
  content?: string;
  /** @format int64 */
  authorId?: number;
  authorNickname?: string;
  authorProfileImageURL?: string;
  tags?: (
    | "FUNNY"
    | "CALM"
    | "PASSIONATE"
    | "HEARTWARMING"
    | "DEEP_THOUGHT"
    | "INSIGHTFUL"
    | "DIVERSE_OPINIONS"
    | "TALKATIVE"
    | "GOOD_LISTENERS"
    | "STRUCTURED"
    | "CASUAL"
    | "WELL_MODERATED"
  )[];
  /** @format date */
  createdAt?: string;
  /** @format date */
  modifiedAt?: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseGroupJoinResponse {
  isSuccessful?: boolean;
  data?: GroupJoinResponse;
}

export interface GroupJoinResponse {
  /** @format int64 */
  groupId?: number;
  /** @format int64 */
  memberId?: number;
  memberName?: string;
  isAccepted?: boolean;
}

export interface GroupChatRequest {
  content: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseGroupChatResponse {
  isSuccessful?: boolean;
  data?: GroupChatResponse;
}

export interface GroupChatResponse {
  /** @format int64 */
  chatId?: number;
  /** @format int64 */
  groupId?: number;
  /** @format int64 */
  authorId?: number;
  authorName?: string;
  authorProfileImage?: string;
  content?: string;
  /** @format date-time */
  createdAt?: string;
}

export interface ActivityPostRequest {
  /** @format int64 */
  bookId: number;
  /** @format date */
  startTime: string;
  /** @format date */
  endTime: string;
  description?: string;
}

export interface ActivityPostResponse {
  /** @format int64 */
  activityId?: number;
  /** @format int64 */
  bookId?: number;
  /** @format date */
  startTime?: string;
  /** @format date */
  endTime?: string;
  description?: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseActivityPostResponse {
  isSuccessful?: boolean;
  data?: ActivityPostResponse;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseString {
  isSuccessful?: boolean;
  data?: string;
}

export interface DiscussionCommentPostRequest {
  /** @format int64 */
  parentId?: number;
  content: string;
  stance: "AGREE" | "DISAGREE" | "NEUTRAL";
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseDiscussionCommentFetchResponse {
  isSuccessful?: boolean;
  data?: DiscussionCommentFetchResponse;
}

export interface DiscussionCommentFetchResponse {
  /** @format int64 */
  commentId?: number;
  /** @format int64 */
  authorId?: number;
  authorName?: string;
  authorProfileImageURL?: string;
  content?: string;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  modifiedAt?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  stance?: "AGREE" | "DISAGREE" | "NEUTRAL";
  /** @format int64 */
  parentId?: number;
  replies?: DiscussionCommentFetchResponse[];
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseCreditPaymentApproveResponse {
  isSuccessful?: boolean;
  data?: CreditPaymentApproveResponse;
}

export interface CreditPaymentApproveResponse {
  orderId?: string;
  /** @format int32 */
  creditProductId?: number;
  creditProductName?: string;
  paymentMethod?: string;
  /** @format int32 */
  paymentAmount?: number;
  /** @format date-time */
  approvedAt?: string;
}

export interface CreditPaymentReadyRequest {
  /** @format int64 */
  creditProductId?: number;
}

/** 전자책 업로드 요청 데이터 */
export interface EbookPostRequest {
  /**
   * 책 제목
   * @example "이상한 나라의 앨리스"
   */
  title: string;
  /**
   * 책 저자
   * @example "루이스 캐럴"
   */
  author: string;
  /**
   * 책 설명
   * @example "《이상한 나라의 앨리스》는 영국의 수학자이자 작가인 찰스 루트위지 도지슨이 루이스 캐럴이라는 필명으로 1865년에 발표한 소설이다."
   */
  description?: string;
  /** @format binary */
  file: File;
  /**
   * 책 가격
   * @format int32
   * @example 10000
   */
  price: number;
  /** @format binary */
  coverImageFile?: File;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseEbookPostResponse {
  isSuccessful?: boolean;
  data?: EbookPostResponse;
}

export interface EbookPostResponse {
  /** @format int64 */
  bookId?: number;
  title?: string;
  author?: string;
  description?: string;
  coverImageURL?: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseEbookPurchaseResponse {
  isSuccessful?: boolean;
  data?: EbookPurchaseResponse;
}

export interface EbookPurchaseResponse {
  /** @format int64 */
  userId?: number;
  /** @format int64 */
  transactionId?: number;
  /** @format int32 */
  creditAmount?: number;
  /** @format int64 */
  bookId?: number;
  title?: string;
  author?: string;
  presignedDownloadURL?: string;
}

export interface RejectPublisherRequest {
  reason: string;
}

export interface DiscussionPostRequest {
  title: string;
  content: string;
  isDebate: boolean;
  highlightIds?: number[];
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseDiscussionFetchResponse {
  isSuccessful?: boolean;
  data?: DiscussionFetchResponse;
}

export interface DiscussionFetchResponse {
  /** @format int64 */
  discussionId?: number;
  /** @format int64 */
  activityId?: number;
  title?: string;
  content?: string;
  /** @format int64 */
  authorId?: number;
  authorName?: string;
  authorProfileImage?: string;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  modifiedAt?: string;
  /** @format int64 */
  commentCount?: number;
  highlightIds?: number[];
  isDebate?: boolean;
  isAuthor?: boolean;
}

export interface HighlightPutRequest {
  /** @format int64 */
  activityId?: number;
  memo?: string;
}

export interface GroupPatchRequest {
  name?: string;
  tags?: string[];
  description?: string;
  /** @format binary */
  groupImage?: File;
}

export interface ActivityPatchRequest {
  /** @format int64 */
  activityId: number;
  /** @format date */
  startTime?: string;
  /** @format date */
  endTime?: string;
  description?: string;
}

export interface DiscussionPatchRequest {
  title?: string;
  content?: string;
  highlightIds?: number[];
}

export interface DiscussionCommentPatchRequest {
  content?: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseUserInfoResponse {
  isSuccessful?: boolean;
  data?: UserInfoResponse;
}

export interface UserInfoResponse {
  /** @format int64 */
  userId?: number;
  nickname?: string;
  profileImageURL?: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponsePageResponseHighlightFetchResponse {
  isSuccessful?: boolean;
  data?: PageResponseHighlightFetchResponse;
}

export interface DiscussionSummaryResponse {
  /** @format int64 */
  discussionId?: number;
  /** @format int64 */
  activityId?: number;
  title?: string;
  /** @format int64 */
  authorId?: number;
  authorName?: string;
}

export interface HighlightFetchResponse {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  bookId?: number;
  /** @format int64 */
  authorId?: number;
  authorName?: string;
  authorProfileImageURL?: string;
  spine?: string;
  cfi?: string;
  memo?: string;
  /** @format int64 */
  activityId?: number;
  linkedDiscussions?: DiscussionSummaryResponse[];
  highlightContent?: string;
}

export interface PageResponseHighlightFetchResponse {
  content?: HighlightFetchResponse[];
  /** @format int32 */
  currentPage?: number;
  /** @format int64 */
  totalItems?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface Pageable {
  /**
   * @format int32
   * @min 0
   */
  page?: number;
  /**
   * @format int32
   * @min 1
   */
  size?: number;
  sort?: string[];
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponsePageResponseGroupFetchResponse {
  isSuccessful?: boolean;
  data?: PageResponseGroupFetchResponse;
}

export interface GroupFetchResponse {
  /** @format int64 */
  groupId?: number;
  name?: string;
  description?: string;
  tags?: string[];
  groupImageURL?: string;
  /** @format int64 */
  leaderId?: number;
  leaderNickname?: string;
  leaderProfileImageURL?: string;
  myMemberShipStatus?: "OWNED" | "PENDING" | "JOINED" | "NONE";
  /** @format int32 */
  memberCount?: number;
}

export interface PageResponseGroupFetchResponse {
  content?: GroupFetchResponse[];
  /** @format int32 */
  currentPage?: number;
  /** @format int64 */
  totalItems?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface ActivityFetchResponse {
  /** @format int64 */
  activityId?: number;
  /** @format int64 */
  groupId?: number;
  /** @format int64 */
  bookId?: number;
  bookTitle?: string;
  bookAuthor?: string;
  coverImageURL?: string;
  bookDescription?: string;
  /** @format date */
  startTime?: string;
  /** @format date */
  endTime?: string;
  description?: string;
  isParticipant?: boolean;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponsePageResponseActivityFetchResponse {
  isSuccessful?: boolean;
  data?: PageResponseActivityFetchResponse;
}

export interface PageResponseActivityFetchResponse {
  content?: ActivityFetchResponse[];
  /** @format int32 */
  currentPage?: number;
  /** @format int64 */
  totalItems?: number;
  /** @format int32 */
  totalPages?: number;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseReadingProgressResponse {
  isSuccessful?: boolean;
  data?: ReadingProgressResponse;
}

export interface ReadingProgressResponse {
  /** @format int64 */
  bookId?: number;
  /** @format int64 */
  userId?: number;
  userNickname?: string;
  userProfileImageURL?: string;
  cfi?: string;
  /** @format int64 */
  percentage?: number;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponsePageResponseReadingProgressResponse {
  isSuccessful?: boolean;
  data?: PageResponseReadingProgressResponse;
}

export interface PageResponseReadingProgressResponse {
  content?: ReadingProgressResponse[];
  /** @format int32 */
  currentPage?: number;
  /** @format int64 */
  totalItems?: number;
  /** @format int32 */
  totalPages?: number;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponsePublisherInfoResponse {
  isSuccessful?: boolean;
  data?: PublisherInfoResponse;
}

export interface PublisherInfoResponse {
  /** @format int64 */
  publisherId?: number;
  publisherName?: string;
  profileImageURL?: string;
  status?: string;
  /** @format date-time */
  createdAt?: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponsePageResponseNotificationResponse {
  isSuccessful?: boolean;
  data?: PageResponseNotificationResponse;
}

export interface NotificationResponse {
  /** @format int64 */
  id?: number;
  message?: string;
  type?:
    | "GROUP_JOIN_REQUEST"
    | "GROUP_JOIN_APPROVED"
    | "GROUP_JOIN_REJECTED"
    | "PUBLISHER_JOIN_REQUEST"
    | "PUBLISHER_APPROVED"
    | "PUBLISHER_REJECTED"
    | "DISCUSSION_COMMENT"
    | "COMMENT_REPLY"
    | "HIGHLIGHT_COMMENT"
    | "HIGHLIGHT_COMMENT_REPLY"
    | "GROUP_BANNED";
  isRead?: boolean;
  /** @format date-time */
  createdAt?: string;
  /** @format int64 */
  senderId?: number;
  senderNickname?: string;
  /** @format int64 */
  groupId?: number;
  groupName?: string;
  /** @format int64 */
  highlightId?: number;
  highlightComments?: string;
  /** @format int64 */
  discussionId?: number;
  discussionContents?: string;
  /** @format int64 */
  discussionCommentsId?: number;
  discussionCommentsContents?: string;
}

export interface PageResponseNotificationResponse {
  content?: NotificationResponse[];
  /** @format int32 */
  currentPage?: number;
  /** @format int64 */
  totalItems?: number;
  /** @format int32 */
  totalPages?: number;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseHighlightFetchResponse {
  isSuccessful?: boolean;
  data?: HighlightFetchResponse;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseListHighlightReactionResponse {
  isSuccessful?: boolean;
  data?: HighlightReactionResponse[];
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseListHighlightCommentResponse {
  isSuccessful?: boolean;
  data?: HighlightCommentResponse[];
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponsePageResponseGroupReviewFetchResponse {
  isSuccessful?: boolean;
  data?: PageResponseGroupReviewFetchResponse;
}

export interface PageResponseGroupReviewFetchResponse {
  content?: GroupReviewFetchResponse[];
  /** @format int32 */
  currentPage?: number;
  /** @format int64 */
  totalItems?: number;
  /** @format int32 */
  totalPages?: number;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseGroupReviewStatsResponse {
  isSuccessful?: boolean;
  data?: GroupReviewStatsResponse;
}

export interface GroupReviewStatsResponse {
  /** @format int64 */
  reviewCount?: number;
  /** @format int64 */
  tagCount?: number;
  tagStats?: TagStatDto[];
}

export interface TagStatDto {
  tag?:
    | "FUNNY"
    | "CALM"
    | "PASSIONATE"
    | "HEARTWARMING"
    | "DEEP_THOUGHT"
    | "INSIGHTFUL"
    | "DIVERSE_OPINIONS"
    | "TALKATIVE"
    | "GOOD_LISTENERS"
    | "STRUCTURED"
    | "CASUAL"
    | "WELL_MODERATED";
  /** @format int64 */
  count?: number;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponsePageResponseGroupMemberResponse {
  isSuccessful?: boolean;
  data?: PageResponseGroupMemberResponse;
}

export interface GroupMemberResponse {
  /** @format int64 */
  userId?: number;
  nickname?: string;
  profileImageURL?: string;
  isApproved?: boolean;
  isLeader?: boolean;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  approvedAt?: string;
}

export interface PageResponseGroupMemberResponse {
  content?: GroupMemberResponse[];
  /** @format int32 */
  currentPage?: number;
  /** @format int64 */
  totalItems?: number;
  /** @format int32 */
  totalPages?: number;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseGroupFetchResponse {
  isSuccessful?: boolean;
  data?: GroupFetchResponse;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponsePageResponseGroupChatResponse {
  isSuccessful?: boolean;
  data?: PageResponseGroupChatResponse;
}

export interface PageResponseGroupChatResponse {
  content?: GroupChatResponse[];
  /** @format int32 */
  currentPage?: number;
  /** @format int64 */
  totalItems?: number;
  /** @format int32 */
  totalPages?: number;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseDiscussionDetailResponse {
  isSuccessful?: boolean;
  data?: DiscussionDetailResponse;
}

export interface DiscussionDetailResponse {
  /** @format int64 */
  discussionId?: number;
  /** @format int64 */
  activityId?: number;
  title?: string;
  content?: string;
  /** @format int64 */
  authorId?: number;
  authorName?: string;
  authorProfileImage?: string;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  modifiedAt?: string;
  /** @format int64 */
  commentCount?: number;
  isDebate?: boolean;
  isAuthor?: boolean;
  linkedHighlights?: HighlightSummaryResponse[];
  comments?: DiscussionCommentFetchResponse[];
}

export interface HighlightSummaryResponse {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  bookId?: number;
  /** @format int64 */
  authorId?: number;
  authorName?: string;
  authorProfileImageURL?: string;
  spine?: string;
  cfi?: string;
  memo?: string;
  highlightContent?: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseListCreditProductInfoResponse {
  isSuccessful?: boolean;
  data?: CreditProductInfoResponse[];
}

export interface CreditProductInfoResponse {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  creditAmount?: number;
  /** @format int32 */
  price?: number;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseCreditWalletResponse {
  isSuccessful?: boolean;
  data?: CreditWalletResponse;
}

export interface CreditWalletResponse {
  /** @format int64 */
  walletId?: number;
  /** @format int64 */
  balance?: number;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponsePageResponseCreditTransactionResponse {
  isSuccessful?: boolean;
  data?: PageResponseCreditTransactionResponse;
}

export interface CreditTransactionResponse {
  orderId?: string;
  /** @format int32 */
  productId?: number;
  productName?: string;
  type?: "CHARGE" | "REFUND";
  /** @format int32 */
  creditAmount?: number;
  /** @format int32 */
  paymentAmount?: number;
  description?: string;
  /** @format date-time */
  approvedAt?: string;
}

export interface PageResponseCreditTransactionResponse {
  content?: CreditTransactionResponse[];
  /** @format int32 */
  currentPage?: number;
  /** @format int64 */
  totalItems?: number;
  /** @format int32 */
  totalPages?: number;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponsePageResponseEbookFetchResponse {
  isSuccessful?: boolean;
  data?: PageResponseEbookFetchResponse;
}

export interface EbookFetchResponse {
  /** @format int64 */
  id?: number;
  title?: string;
  bookCoverImageURL?: string;
  author?: string;
  description?: string;
  /** @format int64 */
  size?: number;
  isPurchased?: boolean;
  /** @format int32 */
  price?: number;
}

export interface PageResponseEbookFetchResponse {
  content?: EbookFetchResponse[];
  /** @format int32 */
  currentPage?: number;
  /** @format int64 */
  totalItems?: number;
  /** @format int32 */
  totalPages?: number;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseEbookFetchResponse {
  isSuccessful?: boolean;
  data?: EbookFetchResponse;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseEbookDownloadResponse {
  isSuccessful?: boolean;
  data?: EbookDownloadResponse;
}

export interface EbookDownloadResponse {
  presignedUrl?: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponsePageResponseUserInfoResponse {
  isSuccessful?: boolean;
  data?: PageResponseUserInfoResponse;
}

export interface PageResponseUserInfoResponse {
  content?: UserInfoResponse[];
  /** @format int32 */
  currentPage?: number;
  /** @format int64 */
  totalItems?: number;
  /** @format int32 */
  totalPages?: number;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponsePageResponsePublisherInfoResponse {
  isSuccessful?: boolean;
  data?: PageResponsePublisherInfoResponse;
}

export interface PageResponsePublisherInfoResponse {
  content?: PublisherInfoResponse[];
  /** @format int32 */
  currentPage?: number;
  /** @format int64 */
  totalItems?: number;
  /** @format int32 */
  totalPages?: number;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseActivityFetchResponse {
  isSuccessful?: boolean;
  data?: ActivityFetchResponse;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponsePageResponseDiscussionFetchResponse {
  isSuccessful?: boolean;
  data?: PageResponseDiscussionFetchResponse;
}

export interface PageResponseDiscussionFetchResponse {
  content?: DiscussionFetchResponse[];
  /** @format int32 */
  currentPage?: number;
  /** @format int64 */
  totalItems?: number;
  /** @format int32 */
  totalPages?: number;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
  onExpiredAccessToken?: () => void;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

type UnsafeApiResponseBody = {
  isSuccessful?: boolean;
  data?: unknown;
  error?: unknown;
};

export type ApiResponse<D, E> =
  | {
      isSuccessful: true;
      data: D;
    }
  | {
      isSuccessful: false;
      error: E;
      errorCode: string;
      errorMessage: string;
    };

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "http://localhost:8080";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);
  private onExpiredAccessToken?: ApiConfig<SecurityDataType>["onExpiredAccessToken"];

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        if (property === undefined || property === null) {
          return formData;
        }
        if (property instanceof Blob) {
          formData.append(key, property);
          return formData;
        }
        if (property instanceof Array) {
          return property.reduce((formData, property) => {
            formData.append(key, `${property}`);
            return formData;
          }, formData);
        }
        if (typeof property === "object" && property !== null) {
          formData.append(key, JSON.stringify(property));
          return formData;
        }
        if (typeof property === "number" || typeof property === "string") {
          formData.append(key, `${property}`);
          return formData;
        }
        throw new Error(
          `The request body property "${key}" is not a valid type.`,
        );
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <
    T = any,
    E = any,
    R = ApiResponse<NonNullable<T["data"]>, E>,
  >({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<R> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = await response[responseFormat || "json"]()
        .then((data) => {
          return data as R;
        })
        .catch((error) => {
          return {
            isSuccessful: false,
            error: error,
            errorCode: "UNKNOWN_ERROR",
            errorMessage: "Unknown error occurred",
          } as R;
        });

      if (!data.isSuccessful) {
        if (data.errorCode === "EXPIRED_ACCESS_TOKEN") {
          this.onExpiredAccessToken();
        }
      }

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      return data;
    });
  };
}

/**
 * @title Chaekit API
 * @version 1.0
 * @baseUrl http://localhost:8080
 *
 * 책잇 API 명세서
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  userController = {
    /**
     * @description 회원가입을 진행합니다.
     *
     * @tags user-controller
     * @name UserJoin
     * @summary 회원가입
     * @request POST:/api/users/join
     * @secure
     */
    userJoin: (data: UserJoinRequest, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseLoginResponse, any>({
        path: `/api/users/join`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * @description 내 계정 정보를 조회합니다.
     *
     * @tags user-controller
     * @name UserInfo
     * @summary 내 계정 정보 조회
     * @request GET:/api/users/me
     * @secure
     */
    userInfo: (params: RequestParams = {}) =>
      this.request<ApiSuccessResponseUserInfoResponse, any>({
        path: `/api/users/me`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 내가 작성한 하이라이트를 조회합니다.
     *
     * @tags user-controller
     * @name GetMyHighlights
     * @summary 내 하이라이트 조회
     * @request GET:/api/users/me/highlights
     * @secure
     */
    getMyHighlights: (
      query?: {
        /**
         * Zero-based page index (0..N)
         * @min 0
         * @default 0
         */
        page?: number;
        /**
         * The size of the page to be returned
         * @min 1
         * @default 20
         */
        size?: number;
        /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
        sort?: string[];
        /** @format int64 */
        bookId?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseHighlightFetchResponse, any>({
        path: `/api/users/me/highlights`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 내가 가입한 모든 모임을 조회합니다.
     *
     * @tags user-controller
     * @name GetMyGroups
     * @summary 내 모임 조회
     * @request GET:/api/users/me/groups
     * @secure
     */
    getMyGroups: (
      query: {
        pageable: Pageable;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseGroupFetchResponse, any>({
        path: `/api/users/me/groups`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 내가 가입한 모든 활동을 조회합니다.
     *
     * @tags user-controller
     * @name GetMyActivities
     * @summary 내 활동 조회
     * @request GET:/api/users/me/activities
     * @secure
     */
    getMyActivities: (
      query: {
        /** @format int64 */
        bookId?: number;
        pageable: Pageable;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseActivityFetchResponse, any>({
        path: `/api/users/me/activities`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
  tokenController = {
    /**
     * @description Access Token이 만료되었을 때, 유효한 Refresh Token을 통해 새로운 Access Token을 발급받는 API
     *
     * @tags token-controller
     * @name RefreshAccessToken
     * @summary Access Token 재발급
     * @request POST:/api/token/refresh
     * @secure
     */
    refreshAccessToken: (
      data: RefreshTokenRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseRefreshTokenResponse, any>({
        path: `/api/token/refresh`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 로그아웃 요청 시 기존 Refresh Token을 무효화합니다.
     *
     * @tags token-controller
     * @name Logout
     * @summary 로그아웃
     * @request POST:/api/logout
     * @secure
     */
    logout: (data: RefreshTokenRequest, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseVoid, any>({
        path: `/api/logout`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  readingProgressController = {
    /**
     * No description
     *
     * @tags reading-progress-controller
     * @name SaveMyProgress
     * @request POST:/api/reading-progress/{bookId}/save
     * @secure
     */
    saveMyProgress: (
      bookId: number,
      data: ReadingProgressRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseVoid, any>({
        path: `/api/reading-progress/${bookId}/save`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags reading-progress-controller
     * @name GetMyProgress
     * @request GET:/api/reading-progress/{bookId}
     * @secure
     */
    getMyProgress: (bookId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseReadingProgressResponse, any>({
        path: `/api/reading-progress/${bookId}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 특정 독서모임 활동에 속하는 모든 사용자의 진행률 정보를 가져옵니다
     *
     * @tags reading-progress-controller
     * @name GetProgressFromActivity
     * @summary 모든 활동 멤버의 독서 진행률 조회
     * @request GET:/api/reading-progress/activities/{activityId}
     * @secure
     */
    getProgressFromActivity: (
      activityId: number,
      query: {
        pageable: Pageable;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseReadingProgressResponse, any>({
        path: `/api/reading-progress/activities/${activityId}`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
  publisherController = {
    /**
     * No description
     *
     * @tags publisher-controller
     * @name PublisherJoin
     * @request POST:/api/publishers/join
     * @secure
     */
    publisherJoin: (data: PublisherJoinRequest, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseLoginResponse, any>({
        path: `/api/publishers/join`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * No description
     *
     * @tags publisher-controller
     * @name PublisherInfo
     * @request GET:/api/publishers/me
     * @secure
     */
    publisherInfo: (params: RequestParams = {}) =>
      this.request<ApiSuccessResponsePublisherInfoResponse, any>({
        path: `/api/publishers/me`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  loginFilterController = {
    /**
     * @description Spring Security가 처리하는 로그인 API
     *
     * @tags login-filter-controller
     * @name Login
     * @summary 로그인
     * @request POST:/api/login
     * @secure
     */
    login: (data: LoginRequest, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseLoginResponse, any>({
        path: `/api/login`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  highlightController = {
    /**
     * No description
     *
     * @tags highlight-controller
     * @name GetHighlights
     * @request GET:/api/highlights
     * @secure
     */
    getHighlights: (
      query: {
        /**
         * Zero-based page index (0..N)
         * @min 0
         * @default 0
         */
        page?: number;
        /**
         * The size of the page to be returned
         * @min 1
         * @default 20
         */
        size?: number;
        /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
        sort?: string[];
        /** @format int64 */
        activityId?: number;
        /** @format int64 */
        bookId?: number;
        spine?: string;
        me: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseHighlightFetchResponse, any>({
        path: `/api/highlights`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags highlight-controller
     * @name CreateHighlight
     * @request POST:/api/highlights
     * @secure
     */
    createHighlight: (data: HighlightPostRequest, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseHighlightPostResponse, any>({
        path: `/api/highlights`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags highlight-controller
     * @name GetHighlightReactions
     * @request GET:/api/highlights/{highlightId}/reactions
     * @secure
     */
    getHighlightReactions: (highlightId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseListHighlightReactionResponse, any>({
        path: `/api/highlights/${highlightId}/reactions`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags highlight-controller
     * @name GetHighlight
     * @request GET:/api/highlights/{id}
     * @secure
     */
    getHighlight: (id: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseHighlightFetchResponse, any>({
        path: `/api/highlights/${id}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags highlight-controller
     * @name DeleteHighlight
     * @request DELETE:/api/highlights/{id}
     * @secure
     */
    deleteHighlight: (id: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseString, any>({
        path: `/api/highlights/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags highlight-controller
     * @name UpdateHighlight
     * @request PATCH:/api/highlights/{id}
     * @secure
     */
    updateHighlight: (
      id: number,
      data: HighlightPutRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseHighlightPostResponse, any>({
        path: `/api/highlights/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  highlightReactionController = {
    /**
     * No description
     *
     * @tags highlight-reaction-controller
     * @name AddReaction
     * @request POST:/api/highlights/{highlightId}/reactions
     * @secure
     */
    addReaction: (
      highlightId: number,
      data: HighlightReactionRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseHighlightReactionResponse, any>({
        path: `/api/highlights/${highlightId}/reactions`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags highlight-reaction-controller
     * @name DeleteReaction
     * @request DELETE:/api/highlights/reactions/{reactionId}
     * @secure
     */
    deleteReaction: (reactionId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseString, any>({
        path: `/api/highlights/reactions/${reactionId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  highlightCommentController = {
    /**
     * No description
     *
     * @tags highlight-comment-controller
     * @name GetComments
     * @request GET:/api/highlights/{highlightId}/comments
     * @secure
     */
    getComments: (highlightId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseListHighlightCommentResponse, any>({
        path: `/api/highlights/${highlightId}/comments`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags highlight-comment-controller
     * @name CreateComment
     * @request POST:/api/highlights/{highlightId}/comments
     * @secure
     */
    createComment: (
      highlightId: number,
      data: HighlightCommentRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseHighlightCommentResponse, any>({
        path: `/api/highlights/${highlightId}/comments`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags highlight-comment-controller
     * @name DeleteComment
     * @request DELETE:/api/highlights/comments/{commentId}
     * @secure
     */
    deleteComment: (commentId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseString, any>({
        path: `/api/highlights/comments/${commentId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags highlight-comment-controller
     * @name UpdateComment
     * @request PATCH:/api/highlights/comments/{commentId}
     * @secure
     */
    updateComment: (
      commentId: number,
      data: HighlightCommentRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseHighlightCommentResponse, any>({
        path: `/api/highlights/comments/${commentId}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  groupController = {
    /**
     * No description
     *
     * @tags group-controller
     * @name GetAllGroups
     * @request GET:/api/groups
     * @secure
     */
    getAllGroups: (
      query?: {
        /**
         * Zero-based page index (0..N)
         * @min 0
         * @default 0
         */
        page?: number;
        /**
         * The size of the page to be returned
         * @min 1
         * @default 20
         */
        size?: number;
        /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
        sort?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseGroupFetchResponse, any>({
        path: `/api/groups`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-controller
     * @name CreateGroup
     * @request POST:/api/groups
     * @secure
     */
    createGroup: (data: GroupPostRequest, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseGroupPostResponse, any>({
        path: `/api/groups`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * @description 모임장만 멤버를 추방할 수 있습니다.
     *
     * @tags group-controller
     * @name KickGroupMember
     * @summary 모임 멤버 추방
     * @request POST:/api/groups/{groupId}/members/{userId}/kick
     * @secure
     */
    kickGroupMember: (
      groupId: number,
      userId: number,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseVoid, ApiSuccessResponseVoid>({
        path: `/api/groups/${groupId}/members/${userId}/kick`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-controller
     * @name RequestJoinGroup
     * @request POST:/api/groups/{groupId}/join
     * @secure
     */
    requestJoinGroup: (groupId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseGroupJoinResponse, any>({
        path: `/api/groups/${groupId}/join`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description 모임지기가 하이라이트 연결을 끊고 모임과 자식 엔티티를 삭제할 수 있습니다.
     *
     * @tags group-controller
     * @name DeleteGroup
     * @summary 모임 삭제
     * @request DELETE:/api/groups/{groupId}
     * @secure
     */
    deleteGroup: (groupId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseVoid, ApiSuccessResponseVoid>({
        path: `/api/groups/${groupId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-controller
     * @name UpdateGroup
     * @request PATCH:/api/groups/{groupId}
     * @secure
     */
    updateGroup: (
      groupId: number,
      data: GroupPatchRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseGroupPostResponse, any>({
        path: `/api/groups/${groupId}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-controller
     * @name RejectJoinRequest
     * @request PATCH:/api/groups/{groupId}/members/{userId}/reject
     * @secure
     */
    rejectJoinRequest: (
      groupId: number,
      userId: number,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseVoid, any>({
        path: `/api/groups/${groupId}/members/${userId}/reject`,
        method: "PATCH",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-controller
     * @name ApproveJoinRequest
     * @request PATCH:/api/groups/{groupId}/members/{userId}/approve
     * @secure
     */
    approveJoinRequest: (
      groupId: number,
      userId: number,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseGroupJoinResponse, any>({
        path: `/api/groups/${groupId}/members/${userId}/approve`,
        method: "PATCH",
        secure: true,
        ...params,
      }),

    /**
     * @description 특정 그룹에서 가입된 + 대기중인 멤버 목록을 조회합니다.
     *
     * @tags group-controller
     * @name GetGroupMembers
     * @summary 특정 그룹의 멤버 목록 조회
     * @request GET:/api/groups/{groupId}/members
     * @secure
     */
    getGroupMembers: (
      groupId: number,
      query?: {
        /**
         * Zero-based page index (0..N)
         * @min 0
         * @default 0
         */
        page?: number;
        /**
         * The size of the page to be returned
         * @min 1
         * @default 20
         */
        size?: number;
        /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
        sort?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseGroupMemberResponse, any>({
        path: `/api/groups/${groupId}/members`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-controller
     * @name GetPendingList
     * @request GET:/api/groups/{groupId}/members/pending
     * @secure
     */
    getPendingList: (
      groupId: number,
      query?: {
        /**
         * Zero-based page index (0..N)
         * @min 0
         * @default 0
         */
        page?: number;
        /**
         * The size of the page to be returned
         * @min 1
         * @default 20
         */
        size?: number;
        /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
        sort?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseGroupMemberResponse, any>({
        path: `/api/groups/${groupId}/members/pending`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-controller
     * @name GetGroup
     * @request GET:/api/groups/{groupId}/info
     * @secure
     */
    getGroup: (groupId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseGroupFetchResponse, any>({
        path: `/api/groups/${groupId}/info`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 내가 가입한 모임 목록을 조회합니다.
     *
     * @tags group-controller
     * @name GetJoinedGroups
     * @summary 내가 가입한 모임 목록 조회
     * @request GET:/api/groups/my/joined
     * @secure
     */
    getJoinedGroups: (
      query?: {
        /**
         * Zero-based page index (0..N)
         * @min 0
         * @default 0
         */
        page?: number;
        /**
         * The size of the page to be returned
         * @min 1
         * @default 20
         */
        size?: number;
        /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
        sort?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseGroupFetchResponse, any>({
        path: `/api/groups/my/joined`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 내가 생성한 모임 목록을 조회합니다.
     *
     * @tags group-controller
     * @name GetCreatedGroups
     * @summary 내가 생성한 모임 목록 조회
     * @request GET:/api/groups/my/created
     * @secure
     */
    getCreatedGroups: (
      query?: {
        /**
         * Zero-based page index (0..N)
         * @min 0
         * @default 0
         */
        page?: number;
        /**
         * The size of the page to be returned
         * @min 1
         * @default 20
         */
        size?: number;
        /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
        sort?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseGroupFetchResponse, any>({
        path: `/api/groups/my/created`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-controller
     * @name LeaveGroup
     * @request DELETE:/api/groups/{groupId}/members/leave
     * @secure
     */
    leaveGroup: (groupId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseVoid, any>({
        path: `/api/groups/${groupId}/members/leave`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  groupReviewController = {
    /**
     * @description 모임의 리뷰 목록을 조회합니다.
     *
     * @tags group-review-controller
     * @name GetReviews
     * @summary 모임 리뷰 목록 조회
     * @request GET:/api/groups/{groupId}/reviews
     * @secure
     */
    getReviews: (
      groupId: number,
      query?: {
        /**
         * Zero-based page index (0..N)
         * @min 0
         * @default 0
         */
        page?: number;
        /**
         * The size of the page to be returned
         * @min 1
         * @default 20
         */
        size?: number;
        /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
        sort?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseGroupReviewFetchResponse, any>(
        {
          path: `/api/groups/${groupId}/reviews`,
          method: "GET",
          query: query,
          secure: true,
          ...params,
        },
      ),

    /**
     * @description 모임에 새로운 리뷰를 작성하거나 내용 및 태그를 수정합니다.
     *
     * @tags group-review-controller
     * @name CreateReview
     * @summary 모임 리뷰 작성
     * @request POST:/api/groups/{groupId}/reviews
     * @secure
     */
    createReview: (
      groupId: number,
      data: GroupReviewPostRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseGroupReviewFetchResponse, any>({
        path: `/api/groups/${groupId}/reviews`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 모임의 리뷰 통계를 조회합니다.
     *
     * @tags group-review-controller
     * @name GetReviewStats
     * @summary 모임 리뷰 통계 조회
     * @request GET:/api/groups/{groupId}/reviews/stats
     * @secure
     */
    getReviewStats: (groupId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseGroupReviewStatsResponse, any>({
        path: `/api/groups/${groupId}/reviews/stats`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  groupChatController = {
    /**
     * @description 모임의 채팅 메시지 목록을 조회합니다.
     *
     * @tags group-chat-controller
     * @name GetChats
     * @summary 모임 채팅 메시지 목록 조회
     * @request GET:/api/groups/{groupId}/chats
     * @secure
     */
    getChats: (
      groupId: number,
      query?: {
        /**
         * Zero-based page index (0..N)
         * @min 0
         * @default 0
         */
        page?: number;
        /**
         * The size of the page to be returned
         * @min 1
         * @default 20
         */
        size?: number;
        /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
        sort?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseGroupChatResponse, any>({
        path: `/api/groups/${groupId}/chats`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 모임에 새로운 채팅 메시지를 작성합니다.
     *
     * @tags group-chat-controller
     * @name CreateChat
     * @summary 모임 채팅 메시지 작성
     * @request POST:/api/groups/{groupId}/chats
     * @secure
     */
    createChat: (
      groupId: number,
      data: GroupChatRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseGroupChatResponse, any>({
        path: `/api/groups/${groupId}/chats`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  activityController = {
    /**
     * No description
     *
     * @tags activity-controller
     * @name GetAllActivities
     * @request GET:/api/groups/{groupId}/activities
     * @secure
     */
    getAllActivities: (
      groupId: number,
      query?: {
        /**
         * Zero-based page index (0..N)
         * @min 0
         * @default 0
         */
        page?: number;
        /**
         * The size of the page to be returned
         * @min 1
         * @default 20
         */
        size?: number;
        /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
        sort?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseActivityFetchResponse, any>({
        path: `/api/groups/${groupId}/activities`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags activity-controller
     * @name CreateActivity
     * @request POST:/api/groups/{groupId}/activities
     * @secure
     */
    createActivity: (
      groupId: number,
      data: ActivityPostRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseActivityPostResponse, any>({
        path: `/api/groups/${groupId}/activities`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags activity-controller
     * @name UpdateActivity
     * @request PATCH:/api/groups/{groupId}/activities
     * @secure
     */
    updateActivity: (
      groupId: number,
      data: ActivityPatchRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseActivityPostResponse, any>({
        path: `/api/groups/${groupId}/activities`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 모임 활동에서 탈퇴합니다.
     *
     * @tags activity-controller
     * @name LeaveActivity
     * @summary 모임 활동 탈퇴
     * @request POST:/api/activities/{activityId}/leave
     * @secure
     */
    leaveActivity: (activityId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseVoid, any>({
        path: `/api/activities/${activityId}/leave`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description 모임 활동에 가입합니다.
     *
     * @tags activity-controller
     * @name JoinActivity
     * @summary 모임 활동 가입
     * @request POST:/api/activities/{activityId}/join
     * @secure
     */
    joinActivity: (activityId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseVoid, any>({
        path: `/api/activities/${activityId}/join`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags activity-controller
     * @name GetActivity
     * @request GET:/api/activities/{activityId}
     * @secure
     */
    getActivity: (activityId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseActivityFetchResponse, any>({
        path: `/api/activities/${activityId}`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  emailVerificationController = {
    /**
     * @description 이메일로 인증 코드를 생성하여 발송하는 API입니다. 생성된 인증 코드는 Redis에 저장되며, 유효 기간은 30분입니다.
     *
     * @tags email-verification-controller
     * @name SendVerificationCode
     * @summary 인증 코드 발송
     * @request POST:/api/email-verification/send-verification-code
     * @secure
     */
    sendVerificationCode: (
      query: {
        email: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseString, any>({
        path: `/api/email-verification/send-verification-code`,
        method: "POST",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 사용자가 입력한 인증 코드를 검증합니다. 올바른 코드일 경우 인증 성공 메시지를 반환하고, 실패하면 400 에러를 반환합니다.
     *
     * @tags email-verification-controller
     * @name VerifyCode
     * @summary 인증 코드 검증
     * @request GET:/api/email-verification/verify-code
     * @secure
     */
    verifyCode: (
      query: {
        email: string;
        verificationCode: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseString, any>({
        path: `/api/email-verification/verify-code`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
  discussionController = {
    /**
     * @description 토론 게시글에 토론 댓글을 작성합니다.
     *
     * @tags discussion-controller
     * @name AddComment
     * @summary 토론 댓글 작성
     * @request POST:/api/discussions/{discussionId}/comments
     * @secure
     */
    addComment: (
      discussionId: number,
      data: DiscussionCommentPostRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseDiscussionCommentFetchResponse, any>({
        path: `/api/discussions/${discussionId}/comments`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 특정 활동에 해당하는 토론 목록을 조회합니다.
     *
     * @tags discussion-controller
     * @name GetDiscussions
     * @summary 토론 목록 조회
     * @request GET:/api/activities/{activityId}/discussions
     * @secure
     */
    getDiscussions: (
      activityId: number,
      query?: {
        /**
         * Zero-based page index (0..N)
         * @min 0
         * @default 0
         */
        page?: number;
        /**
         * The size of the page to be returned
         * @min 1
         * @default 20
         */
        size?: number;
        /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
        sort?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseDiscussionFetchResponse, any>({
        path: `/api/activities/${activityId}/discussions`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 특정 활동에 새로운 토론을 생성합니다.
     *
     * @tags discussion-controller
     * @name CreateDiscussion
     * @summary 토론 생성
     * @request POST:/api/activities/{activityId}/discussions
     * @secure
     */
    createDiscussion: (
      activityId: number,
      data: DiscussionPostRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseDiscussionFetchResponse, any>({
        path: `/api/activities/${activityId}/discussions`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 특정 토론에 대해 댓글 등을 포함한 상세 정보를 조회합니다.
     *
     * @tags discussion-controller
     * @name GetDiscussion
     * @summary 토론 상세 조회
     * @request GET:/api/discussions/{discussionId}
     * @secure
     */
    getDiscussion: (discussionId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseDiscussionDetailResponse, any>({
        path: `/api/discussions/${discussionId}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 토론을 삭제합니다.
     *
     * @tags discussion-controller
     * @name DeleteDiscussion
     * @summary 토론 삭제
     * @request DELETE:/api/discussions/{discussionId}
     * @secure
     */
    deleteDiscussion: (discussionId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseVoid, any>({
        path: `/api/discussions/${discussionId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description 토론 제목, 내용, 찬반 여부를 수정합니다.
     *
     * @tags discussion-controller
     * @name UpdateDiscussion
     * @summary 토론 수정
     * @request PATCH:/api/discussions/{discussionId}
     * @secure
     */
    updateDiscussion: (
      discussionId: number,
      data: DiscussionPatchRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseDiscussionFetchResponse, any>({
        path: `/api/discussions/${discussionId}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 토론 댓글을 조회합니다.
     *
     * @tags discussion-controller
     * @name GetComment
     * @summary 토론 댓글 단건 조회
     * @request GET:/api/discussions/comments/{commentId}
     * @secure
     */
    getComment: (commentId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseDiscussionCommentFetchResponse, any>({
        path: `/api/discussions/comments/${commentId}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 토론 댓글을 삭제합니다.
     *
     * @tags discussion-controller
     * @name DeleteComment1
     * @summary 토론 댓글 삭제
     * @request DELETE:/api/discussions/comments/{commentId}
     * @secure
     */
    deleteComment1: (commentId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseVoid, any>({
        path: `/api/discussions/comments/${commentId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description 토론 댓글의 내용을 수정합니다.
     *
     * @tags discussion-controller
     * @name UpdateComment1
     * @summary 토론 댓글 수정
     * @request PATCH:/api/discussions/comments/{commentId}
     * @secure
     */
    updateComment1: (
      commentId: number,
      data: DiscussionCommentPatchRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseDiscussionCommentFetchResponse, any>({
        path: `/api/discussions/comments/${commentId}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  creditController = {
    /**
     * @description 카카오페이 결제 승인 후, 결제 정보를 저장합니다. (결제 승인)
     *
     * @tags credit-controller
     * @name KakaoPaySuccess
     * @summary 카카오페이 결제 승인
     * @request POST:/api/credits/payment/success
     * @secure
     */
    kakaoPaySuccess: (
      query: {
        pg_token: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseCreditPaymentApproveResponse, any>({
        path: `/api/credits/payment/success`,
        method: "POST",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 특정 크레딧 상품에 대해 카카오페이 결제를 요청합니다. (결제 준비)
     *
     * @tags credit-controller
     * @name RequestKakaoPay
     * @summary 카카오페이 결제 redirect URL 요청
     * @request POST:/api/credits/payment/ready
     * @secure
     */
    requestKakaoPay: (
      data: CreditPaymentReadyRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseString, any>({
        path: `/api/credits/payment/ready`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 크레딧 상품 목록을 조회합니다. (구매 가능 상품만 조회)
     *
     * @tags credit-controller
     * @name GetCreditProductList
     * @summary 크레딧 상품 목록 조회
     * @request GET:/api/credits
     * @secure
     */
    getCreditProductList: (params: RequestParams = {}) =>
      this.request<ApiSuccessResponseListCreditProductInfoResponse, any>({
        path: `/api/credits`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 내 크레딧 지갑 정보를 조회합니다.
     *
     * @tags credit-controller
     * @name GetMyWallet
     * @summary 내 크레딧 지갑 조회
     * @request GET:/api/credits/wallets
     * @secure
     */
    getMyWallet: (params: RequestParams = {}) =>
      this.request<ApiSuccessResponseCreditWalletResponse, any>({
        path: `/api/credits/wallets`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 내 크레딧 거래 내역을 조회합니다. (구매, 사용 내역 포함)
     *
     * @tags credit-controller
     * @name GetMyWalletTransactions
     * @summary 내 크레딧 거래 내역 조회
     * @request GET:/api/credits/transactions
     * @secure
     */
    getMyWalletTransactions: (
      query?: {
        /**
         * Zero-based page index (0..N)
         * @min 0
         * @default 0
         */
        page?: number;
        /**
         * The size of the page to be returned
         * @min 1
         * @default 20
         */
        size?: number;
        /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
        sort?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<
        ApiSuccessResponsePageResponseCreditTransactionResponse,
        any
      >({
        path: `/api/credits/transactions`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
  ebookController = {
    /**
     * @description 전자책 목록을 페이지네이션하여 조회합니다.
     *
     * @tags ebook-controller
     * @name GetBooks
     * @summary 전자책 목록 조회
     * @request GET:/api/books
     * @secure
     */
    getBooks: (
      query?: {
        /**
         * Zero-based page index (0..N)
         * @min 0
         * @default 0
         */
        page?: number;
        /**
         * The size of the page to be returned
         * @min 1
         * @default 20
         */
        size?: number;
        /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
        sort?: string[];
        /** 책 제목 */
        title?: string;
        /** 작가명 */
        author?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseEbookFetchResponse, any>({
        path: `/api/books`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 출판사가 전자책 파일과 정보를 업로드합니다.
     *
     * @tags ebook-controller
     * @name UploadFile
     * @summary 전자책 업로드
     * @request POST:/api/books
     * @secure
     */
    uploadFile: (data: EbookPostRequest, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseEbookPostResponse, any>({
        path: `/api/books`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * @description 전자책의 상세 정보를 조회합니다.
     *
     * @tags ebook-controller
     * @name GetBook
     * @summary 전자책 상세 조회
     * @request GET:/api/books/{ebookId}
     * @secure
     */
    getBook: (ebookId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseEbookFetchResponse, any>({
        path: `/api/books/${ebookId}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 관리자가 전자책 다운로드를 위한 URL을 생성합니다.
     *
     * @tags ebook-controller
     * @name DownloadFile
     * @summary 전자책 다운로드 URL 생성
     * @request GET:/api/books/{ebookId}/download
     * @secure
     */
    downloadFile: (ebookId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseEbookDownloadResponse, any>({
        path: `/api/books/${ebookId}/download`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  ebookPurchaseController = {
    /**
     * @description 보유한 크레딧으로 전자책을 구매합니다.
     *
     * @tags ebook-purchase-controller
     * @name PurchaseEbook
     * @summary 전자책 구매
     * @request POST:/api/books/{bookId}/purchase
     * @secure
     */
    purchaseEbook: (bookId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseEbookPurchaseResponse, any>({
        path: `/api/books/${bookId}/purchase`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description 내가 구매한 전자책 목록을 페이지네이션하여 조회합니다.
     *
     * @tags ebook-purchase-controller
     * @name GetMyBooks
     * @summary 내 전자책 목록 조회
     * @request GET:/api/books/my
     * @secure
     */
    getMyBooks: (
      query?: {
        /**
         * Zero-based page index (0..N)
         * @min 0
         * @default 0
         */
        page?: number;
        /**
         * The size of the page to be returned
         * @min 1
         * @default 20
         */
        size?: number;
        /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
        sort?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseEbookFetchResponse, any>({
        path: `/api/books/my`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
  adminController = {
    /**
     * @description 사유를 제시하며 출판사를 거절합니다.
     *
     * @tags admin-controller
     * @name RejectPublisher
     * @summary 출판사 거절
     * @request POST:/api/admin/publishers/{publisherId}/reject
     * @secure
     */
    rejectPublisher: (
      publisherId: number,
      data: RejectPublisherRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseVoid, any>({
        path: `/api/admin/publishers/${publisherId}/reject`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 출판사를 승인합니다.
     *
     * @tags admin-controller
     * @name AcceptPublisher
     * @summary 출판사 승인
     * @request POST:/api/admin/publishers/{publisherId}/accept
     * @secure
     */
    acceptPublisher: (publisherId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseVoid, any>({
        path: `/api/admin/publishers/${publisherId}/accept`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description 모든 유저 목록을 확인할 수 있습니다.
     *
     * @tags admin-controller
     * @name FetchUsers
     * @summary 유저 목록 조회
     * @request GET:/api/admin/users
     * @secure
     */
    fetchUsers: (
      query?: {
        /**
         * Zero-based page index (0..N)
         * @min 0
         * @default 0
         */
        page?: number;
        /**
         * The size of the page to be returned
         * @min 1
         * @default 20
         */
        size?: number;
        /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
        sort?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseUserInfoResponse, any>({
        path: `/api/admin/users`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 모든 출판사 목록을 확인할 수 있습니다.
     *
     * @tags admin-controller
     * @name FetchPublishers
     * @summary 출판사 목록 조회
     * @request GET:/api/admin/publishers
     * @secure
     */
    fetchPublishers: (
      query?: {
        /**
         * Zero-based page index (0..N)
         * @min 0
         * @default 0
         */
        page?: number;
        /**
         * The size of the page to be returned
         * @min 1
         * @default 20
         */
        size?: number;
        /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
        sort?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponsePublisherInfoResponse, any>({
        path: `/api/admin/publishers`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 승인 대기 중인 출판사 목록을 확인할 수 있습니다.
     *
     * @tags admin-controller
     * @name FetchPendingList
     * @summary 출판사 승인 대기 목록 조회
     * @request GET:/api/admin/publishers/pending
     * @secure
     */
    fetchPendingList: (
      query?: {
        /**
         * Zero-based page index (0..N)
         * @min 0
         * @default 0
         */
        page?: number;
        /**
         * The size of the page to be returned
         * @min 1
         * @default 20
         */
        size?: number;
        /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
        sort?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponsePublisherInfoResponse, any>({
        path: `/api/admin/publishers/pending`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
  publisherNotificationController = {
    /**
     * No description
     *
     * @tags publisher-notification-controller
     * @name MarkAsRead
     * @summary 출판사 알림 읽음 처리
     * @request PATCH:/api/publisher/notifications/{notificationId}/read
     * @secure
     */
    markAsRead: (notificationId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseVoid, any>({
        path: `/api/publisher/notifications/${notificationId}/read`,
        method: "PATCH",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags publisher-notification-controller
     * @name GetNotifications
     * @summary 출판사 알림 목록 조회
     * @request GET:/api/publisher/notifications
     * @secure
     */
    getNotifications: (
      query: {
        pageable: Pageable;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseNotificationResponse, any>({
        path: `/api/publisher/notifications`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
  notificationController = {
    /**
     * No description
     *
     * @tags notification-controller
     * @name MarkAsRead1
     * @summary 알림 읽음 처리
     * @request PATCH:/api/notifications/{notificationId}/read
     * @secure
     */
    markAsRead1: (notificationId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseVoid, any>({
        path: `/api/notifications/${notificationId}/read`,
        method: "PATCH",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags notification-controller
     * @name GetNotifications1
     * @summary 알림 목록 조회
     * @request GET:/api/notifications
     * @secure
     */
    getNotifications1: (
      query: {
        pageable: Pageable;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseNotificationResponse, any>({
        path: `/api/notifications`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
  mainController = {
    /**
     * No description
     *
     * @tags main-controller
     * @name MainApi
     * @request GET:/api
     * @secure
     */
    mainApi: (params: RequestParams = {}) =>
      this.request<ApiSuccessResponseString, any>({
        path: `/api`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
}

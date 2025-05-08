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
  role: string;
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

export interface PublisherJoinRequest {
  publisherName: string;
  email: string;
  password: string;
  /** @format binary */
  profileImage?: File;
  verificationCode: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseVoid {
  isSuccessful?: boolean;
  data?: object;
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
}

export interface ReactionRequest {
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
export interface ApiSuccessResponseReactionResponse {
  isSuccessful?: boolean;
  data?: ReactionResponse;
}

export interface ReactionResponse {
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

export interface CommentRequest {
  content?: string;
  /** @format int64 */
  parentId?: number;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseCommentResponse {
  isSuccessful?: boolean;
  data?: CommentResponse;
}

export interface CommentResponse {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  authorId?: number;
  authorName?: string;
  content?: string;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
  replies?: CommentResponse[];
  reactions?: ReactionResponse[];
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

export interface RejectPublisherRequest {
  reason: string;
}

export interface DiscussionPostRequest {
  title: string;
  content: string;
  isDebate: boolean;
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
  isDebate?: boolean;
  isAuthor?: boolean;
}

export interface HighlightPutRequest {
  /** @format int64 */
  activityId?: number;
  memo?: string;
}

export interface GroupPatchRequest {
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
  isDebate?: boolean;
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
export interface ApiSuccessResponsePageResponseHighlightFetchResponse {
  isSuccessful?: boolean;
  data?: PageResponseHighlightFetchResponse;
}

export interface HighlightFetchResponse {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  bookId?: number;
  spine?: string;
  cfi?: string;
  memo?: string;
  /** @format int64 */
  activityId?: number;
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

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseListReactionResponse {
  isSuccessful?: boolean;
  data?: ReactionResponse[];
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseListCommentResponse {
  isSuccessful?: boolean;
  data?: CommentResponse[];
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
  myMemberShipStatus?: "PENDING" | "JOINED" | "NONE";
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

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponsePageResponseGroupPendingMemberResponse {
  isSuccessful?: boolean;
  data?: PageResponseGroupPendingMemberResponse;
}

export interface GroupPendingMemberResponse {
  /** @format int64 */
  userId?: number;
  nickname?: string;
}

export interface PageResponseGroupPendingMemberResponse {
  content?: GroupPendingMemberResponse[];
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

export interface ActivityFetchResponse {
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
  comments?: DiscussionCommentFetchResponse[];
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

export interface EbookSearchRequest {
  authorName?: string;
  bookTitle?: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponsePageResponseEbookSearchResponse {
  isSuccessful?: boolean;
  data?: PageResponseEbookSearchResponse;
}

export interface EbookSearchResponse {
  /** @format int64 */
  id?: number;
  title?: string;
  author?: string;
  coverImageUrl?: string;
}

export interface PageResponseEbookSearchResponse {
  content?: EbookSearchResponse[];
  /** @format int32 */
  currentPage?: number;
  /** @format int64 */
  totalItems?: number;
  /** @format int32 */
  totalPages?: number;
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

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

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
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
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

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
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

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Chaekit API
 * @version 1.0
 *
 * 책잇 API 명세서
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  userController = {
    /**
     * No description
     *
     * @tags user-controller
     * @name UserJoin
     * @request POST:/api/users/join
     */
    userJoin: (data: UserJoinRequest, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseLoginResponse, any>({
        path: `/api/users/join`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * No description
     *
     * @tags user-controller
     * @name UserInfo
     * @request GET:/api/users/me
     */
    userInfo: (params: RequestParams = {}) =>
      this.request<ApiSuccessResponseUserInfoResponse, any>({
        path: `/api/users/me`,
        method: "GET",
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
     */
    refreshAccessToken: (
      data: RefreshTokenRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseRefreshTokenResponse, any>({
        path: `/api/token/refresh`,
        method: "POST",
        body: data,
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
     */
    logout: (data: RefreshTokenRequest, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseVoid, any>({
        path: `/api/logout`,
        method: "POST",
        body: data,
        type: ContentType.Json,
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
     */
    publisherJoin: (data: PublisherJoinRequest, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseLoginResponse, any>({
        path: `/api/publishers/join`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * No description
     *
     * @tags publisher-controller
     * @name PublisherInfo
     * @request GET:/api/publishers/me
     */
    publisherInfo: (params: RequestParams = {}) =>
      this.request<ApiSuccessResponsePublisherInfoResponse, any>({
        path: `/api/publishers/me`,
        method: "GET",
        ...params,
      }),
  };
  loginFilter = {
    /**
     * @description Spring Security가 처리하는 로그인 API
     *
     * @tags login-filter
     * @name Login
     * @summary 로그인
     * @request POST:/api/login
     */
    login: (data: LoginRequest, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseLoginResponse, any>({
        path: `/api/login`,
        method: "POST",
        body: data,
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
     */
    getHighlights: (
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
        activityId?: number;
        /** @format int64 */
        bookId?: number;
        spine?: string;
        me?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseHighlightFetchResponse, any>({
        path: `/api/highlights`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags highlight-controller
     * @name CreateHighlight
     * @request POST:/api/highlights
     */
    createHighlight: (data: HighlightPostRequest, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseHighlightPostResponse, any>({
        path: `/api/highlights`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags highlight-controller
     * @name GetHighlightReactions
     * @request GET:/api/highlights/{highlightId}/reactions
     */
    getHighlightReactions: (highlightId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseListReactionResponse, any>({
        path: `/api/highlights/${highlightId}/reactions`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags highlight-controller
     * @name DeleteHighlight
     * @request DELETE:/api/highlights/{id}
     */
    deleteHighlight: (id: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseString, any>({
        path: `/api/highlights/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags highlight-controller
     * @name UpdateHighlight
     * @request PATCH:/api/highlights/{id}
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
        type: ContentType.Json,
        ...params,
      }),
  };
  reactionController = {
    /**
     * No description
     *
     * @tags reaction-controller
     * @name AddReaction
     * @request POST:/api/highlights/{highlightId}/reactions
     */
    addReaction: (
      highlightId: number,
      data: ReactionRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseReactionResponse, any>({
        path: `/api/highlights/${highlightId}/reactions`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags reaction-controller
     * @name DeleteReaction
     * @request DELETE:/api/highlights/reactions/{reactionId}
     */
    deleteReaction: (reactionId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseString, any>({
        path: `/api/highlights/reactions/${reactionId}`,
        method: "DELETE",
        ...params,
      }),
  };
  commentController = {
    /**
     * No description
     *
     * @tags comment-controller
     * @name GetComments
     * @request GET:/api/highlights/{highlightId}/comments
     */
    getComments: (highlightId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseListCommentResponse, any>({
        path: `/api/highlights/${highlightId}/comments`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags comment-controller
     * @name CreateComment
     * @request POST:/api/highlights/{highlightId}/comments
     */
    createComment: (
      highlightId: number,
      data: CommentRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseCommentResponse, any>({
        path: `/api/highlights/${highlightId}/comments`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags comment-controller
     * @name DeleteComment
     * @request DELETE:/api/highlights/comments/{commentId}
     */
    deleteComment: (commentId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseString, any>({
        path: `/api/highlights/comments/${commentId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags comment-controller
     * @name UpdateComment
     * @request PATCH:/api/highlights/comments/{commentId}
     */
    updateComment: (
      commentId: number,
      data: CommentRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseCommentResponse, any>({
        path: `/api/highlights/comments/${commentId}`,
        method: "PATCH",
        body: data,
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
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-controller
     * @name CreateGroup
     * @request POST:/api/groups
     */
    createGroup: (data: GroupPostRequest, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseGroupPostResponse, any>({
        path: `/api/groups`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-controller
     * @name RequestJoinGroup
     * @request POST:/api/groups/{groupId}/join
     */
    requestJoinGroup: (groupId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseGroupJoinResponse, any>({
        path: `/api/groups/${groupId}/join`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-controller
     * @name UpdateGroup
     * @request PATCH:/api/groups/{groupId}
     */
    updateGroup: (
      groupId: number,
      query: {
        request: GroupPatchRequest;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseGroupPostResponse, any>({
        path: `/api/groups/${groupId}`,
        method: "PATCH",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-controller
     * @name RejectJoinRequest
     * @request PATCH:/api/groups/{groupId}/members/{userId}/reject
     */
    rejectJoinRequest: (
      groupId: number,
      userId: number,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseVoid, any>({
        path: `/api/groups/${groupId}/members/${userId}/reject`,
        method: "PATCH",
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-controller
     * @name ApproveJoinRequest
     * @request PATCH:/api/groups/{groupId}/members/{userId}/approve
     */
    approveJoinRequest: (
      groupId: number,
      userId: number,
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseGroupJoinResponse, any>({
        path: `/api/groups/${groupId}/members/${userId}/approve`,
        method: "PATCH",
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-controller
     * @name GetPendingList
     * @request GET:/api/groups/{groupId}/members/pending
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
      this.request<
        ApiSuccessResponsePageResponseGroupPendingMemberResponse,
        any
      >({
        path: `/api/groups/${groupId}/members/pending`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-controller
     * @name GetGroup
     * @request GET:/api/groups/{groupId}/info
     */
    getGroup: (groupId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseGroupFetchResponse, any>({
        path: `/api/groups/${groupId}/info`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags group-controller
     * @name LeaveGroup
     * @request DELETE:/api/groups/{groupId}/members/leave
     */
    leaveGroup: (groupId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseVoid, any>({
        path: `/api/groups/${groupId}/members/leave`,
        method: "DELETE",
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
        ...params,
      }),

    /**
     * No description
     *
     * @tags activity-controller
     * @name CreateActivity
     * @request POST:/api/groups/{groupId}/activities
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
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags activity-controller
     * @name UpdateActivity
     * @request PATCH:/api/groups/{groupId}/activities
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
        type: ContentType.Json,
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
        ...params,
      }),

    /**
     * @description 사용자가 입력한 인증 코드를 검증합니다. 올바른 코드일 경우 인증 성공 메시지를 반환하고, 실패하면 400 에러를 반환합니다.
     *
     * @tags email-verification-controller
     * @name VerifyCode
     * @summary 인증 코드 검증
     * @request GET:/api/email-verification/verify-code
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
        ...params,
      }),
  };
  토론 = {
    /**
     * @description 토론 게시글에 토론 댓글을 작성합니다.
     *
     * @tags 토론
     * @name AddComment
     * @summary 토론 댓글 작성
     * @request POST:/api/discussions/{discussionId}/comments
     */
    addComment: (
      discussionId: number,
      data: DiscussionCommentPostRequest,
      params: RequestParams = {},
    ) =>
      this.request<DiscussionCommentFetchResponse, any>({
        path: `/api/discussions/${discussionId}/comments`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 특정 활동에 해당하는 토론 목록을 조회합니다.
     *
     * @tags 토론
     * @name GetDiscussions
     * @summary 토론 목록 조회
     * @request GET:/api/activities/{activityId}/discussions
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
      this.request<PageResponseDiscussionFetchResponse, any>({
        path: `/api/activities/${activityId}/discussions`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description 특정 활동에 새로운 토론을 생성합니다.
     *
     * @tags 토론
     * @name CreateDiscussion
     * @summary 토론 생성
     * @request POST:/api/activities/{activityId}/discussions
     */
    createDiscussion: (
      activityId: number,
      data: DiscussionPostRequest,
      params: RequestParams = {},
    ) =>
      this.request<DiscussionFetchResponse, any>({
        path: `/api/activities/${activityId}/discussions`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 특정 토론에 대해 댓글 등을 포함한 상세 정보를 조회합니다.
     *
     * @tags 토론
     * @name GetDiscussion
     * @summary 토론 상세 조회
     * @request GET:/api/discussions/{discussionId}
     */
    getDiscussion: (discussionId: number, params: RequestParams = {}) =>
      this.request<DiscussionDetailResponse, any>({
        path: `/api/discussions/${discussionId}`,
        method: "GET",
        ...params,
      }),

    /**
     * @description 토론을 삭제합니다.
     *
     * @tags 토론
     * @name DeleteDiscussion
     * @summary 토론 삭제
     * @request DELETE:/api/discussions/{discussionId}
     */
    deleteDiscussion: (discussionId: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/discussions/${discussionId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * @description 토론 제목, 내용, 찬반 여부를 수정합니다.
     *
     * @tags 토론
     * @name UpdateDiscussion
     * @summary 토론 수정
     * @request PATCH:/api/discussions/{discussionId}
     */
    updateDiscussion: (
      discussionId: number,
      data: DiscussionPatchRequest,
      params: RequestParams = {},
    ) =>
      this.request<DiscussionFetchResponse, any>({
        path: `/api/discussions/${discussionId}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 토론 댓글을 조회합니다.
     *
     * @tags 토론
     * @name GetComment
     * @summary 토론 댓글 단건 조회
     * @request GET:/api/discussions/comments/{commentId}
     */
    getComment: (commentId: number, params: RequestParams = {}) =>
      this.request<DiscussionCommentFetchResponse, any>({
        path: `/api/discussions/comments/${commentId}`,
        method: "GET",
        ...params,
      }),

    /**
     * @description 토론 댓글을 삭제합니다.
     *
     * @tags 토론
     * @name DeleteComment1
     * @summary 토론 댓글 삭제
     * @request DELETE:/api/discussions/comments/{commentId}
     */
    deleteComment1: (commentId: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/discussions/comments/${commentId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * @description 토론 댓글의 내용을 수정합니다.
     *
     * @tags 토론
     * @name UpdateComment1
     * @summary 토론 댓글 수정
     * @request PATCH:/api/discussions/comments/{commentId}
     */
    updateComment1: (
      commentId: number,
      data: DiscussionCommentPatchRequest,
      params: RequestParams = {},
    ) =>
      this.request<DiscussionCommentFetchResponse, any>({
        path: `/api/discussions/comments/${commentId}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  ebook = {
    /**
     * @description 전자책 목록을 페이지네이션하여 조회합니다.
     *
     * @tags Ebook
     * @name GetBooks
     * @summary 전자책 목록 조회
     * @request GET:/api/books
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
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseEbookFetchResponse, any>({
        path: `/api/books`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description 출판사가 전자책 파일과 정보를 업로드합니다.
     *
     * @tags Ebook
     * @name UploadFile
     * @summary 전자책 업로드
     * @request POST:/api/books
     */
    uploadFile: (data: EbookPostRequest, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseEbookPostResponse, any>({
        path: `/api/books`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Ebook
     * @name SearchEbooks
     * @request GET:/api/books/search
     */
    searchEbooks: (
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
        request: EbookSearchRequest;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponsePageResponseEbookSearchResponse, any>({
        path: `/api/books/search`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description 관리자가 전자책 다운로드를 위한 URL을 생성합니다.
     *
     * @tags Ebook
     * @name DownloadFile
     * @summary 전자책 다운로드 URL 생성
     * @request GET:/api/books/download/{ebookId}
     */
    downloadFile: (ebookId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseEbookDownloadResponse, any>({
        path: `/api/books/download/${ebookId}`,
        method: "GET",
        ...params,
      }),
  };
  admin = {
    /**
     * @description 사유를 제시하며 출판사를 거절합니다.
     *
     * @tags Admin
     * @name RejectPublisher
     * @summary 출판사 거절
     * @request POST:/api/admin/publishers/{publisherId}/reject
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
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 출판사를 승인합니다.
     *
     * @tags Admin
     * @name AcceptPublisher
     * @summary 출판사 승인
     * @request POST:/api/admin/publishers/{publisherId}/accept
     */
    acceptPublisher: (publisherId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseVoid, any>({
        path: `/api/admin/publishers/${publisherId}/accept`,
        method: "POST",
        ...params,
      }),

    /**
     * @description 모든 유저 목록을 확인할 수 있습니다.
     *
     * @tags Admin
     * @name FetchUsers
     * @summary 유저 목록 조회
     * @request GET:/api/admin/users
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
        ...params,
      }),

    /**
     * @description 모든 출판사 목록을 확인할 수 있습니다.
     *
     * @tags Admin
     * @name FetchPublishers
     * @summary 출판사 목록 조회
     * @request GET:/api/admin/publishers
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
        ...params,
      }),

    /**
     * @description 승인 대기 중인 출판사 목록을 확인할 수 있습니다.
     *
     * @tags Admin
     * @name FetchPendingList
     * @summary 출판사 승인 대기 목록 조회
     * @request GET:/api/admin/publishers/pending
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
     */
    mainApi: (params: RequestParams = {}) =>
      this.request<ApiSuccessResponseString, any>({
        path: `/api`,
        method: "GET",
        ...params,
      }),
  };
}

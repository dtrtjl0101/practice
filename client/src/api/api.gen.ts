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

export interface HighlightPutRequest {
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
}

export interface GroupPutRequest {
  description?: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseGroupPostResponse {
  isSuccessful?: boolean;
  data?: GroupPostResponse;
}

export interface GroupFetchResponse {
  /** @format int64 */
  groupId?: number;
  name?: string;
  description?: string;
  tags?: string[];
  /** @format int32 */
  memberCount?: number;
}

export interface GroupPostResponse {
  group?: GroupFetchResponse;
}

export interface UserJoinRequest {
  nickname: string;
  username: string;
  password: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseUserJoinResponse {
  isSuccessful?: boolean;
  data?: UserJoinResponse;
}

export interface UserJoinResponse {
  /** @format int64 */
  id?: number;
  accessToken?: string;
  nickname?: string;
  username?: string;
  role?: string;
}

export interface PublisherJoinRequest {
  publisherName: string;
  username: string;
  password: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponsePublisherJoinResponse {
  isSuccessful?: boolean;
  data?: PublisherJoinResponse;
}

export interface PublisherJoinResponse {
  /** @format int64 */
  id?: number;
  accessToken?: string;
  publisherName?: string;
  username?: string;
  role?: string;
  isAccepted?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseLoginResponse {
  isSuccessful?: boolean;
  data?: LoginResponse;
}

export interface LoginResponse {
  /** @format int64 */
  id?: number;
  role?: string;
  accessToken?: string;
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

export interface GroupPostRequest {
  name?: string;
  description?: string;
  tags?: string[];
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseBoolean {
  isSuccessful?: boolean;
  data?: boolean;
}

export interface EbookUploadRequest {
  /**
   * 책 제목
   * @example "이상한 나라의 앨리스"
   */
  title?: string;
  /**
   * 책 저자
   * @example "루이스 캐럴"
   */
  author?: string;
  /**
   * 책 설명
   * @example "《이상한 나라의 앨리스》는 영국의 수학자이자 작가인 찰스 루트위지 도지슨이 루이스 캐럴이라는 필명으로 1865년에 발표한 소설이다."
   */
  description?: string;
  /** @format binary */
  file?: File;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseString {
  isSuccessful?: boolean;
  data?: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseUserMemberResponse {
  isSuccessful?: boolean;
  data?: UserMemberResponse;
}

export interface UserMemberResponse {
  /** @format int64 */
  id?: number;
  nickname?: string;
  username?: string;
  role?: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponsePublisherMemberResponse {
  isSuccessful?: boolean;
  data?: PublisherMemberResponse;
}

export interface PublisherMemberResponse {
  /** @format int64 */
  id?: number;
  publisherName?: string;
  username?: string;
  role?: string;
  isAccepted?: boolean;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseHighlightListResponse {
  isSuccessful?: boolean;
  data?: HighlightListResponse;
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

export interface HighlightListResponse {
  highlights?: HighlightFetchResponse[];
  /** @format int32 */
  currentPage?: number;
  /** @format int64 */
  totalItems?: number;
  /** @format int32 */
  totalPages?: number;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseGroupListResponse {
  isSuccessful?: boolean;
  data?: GroupListResponse;
}

export interface GroupListResponse {
  groups?: GroupFetchResponse[];
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
export interface ApiSuccessResponseListPublisherInfoResponse {
  isSuccessful?: boolean;
  data?: PublisherInfoResponse[];
}

export interface PublisherInfoResponse {
  /** @format int64 */
  id?: number;
  publisherName?: string;
  /** @format date-time */
  createdAt?: string;
}

/** API 에러 응답을 감싸는 클래스 */
export interface ApiSuccessResponseEbookListResponse {
  isSuccessful?: boolean;
  data?: EbookListResponse;
}

export interface EbookFetchResponse {
  /** @format int64 */
  id?: number;
  title?: string;
  author?: string;
  description?: string;
  /** @format int64 */
  size?: number;
}

export interface EbookListResponse {
  books?: EbookFetchResponse[];
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

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
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
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

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
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== "string" ? JSON.stringify(input) : input),
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

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
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

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
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

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
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
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  highlightController = {
    /**
     * No description
     *
     * @tags highlight-controller
     * @name UpdateHighlight
     * @request PUT:/api/highlights/{id}
     */
    updateHighlight: (id: number, data: HighlightPutRequest, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseHighlightPostResponse, any>({
        path: `/api/highlights/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

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
      this.request<ApiSuccessResponseHighlightListResponse, any>({
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
  };
  groupController = {
    /**
     * No description
     *
     * @tags group-controller
     * @name UpdateGroup
     * @request PUT:/api/groups/{groupId}
     */
    updateGroup: (groupId: number, data: GroupPutRequest, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseGroupPostResponse, any>({
        path: `/api/groups/${groupId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

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
      this.request<ApiSuccessResponseGroupListResponse, any>({
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
        type: ContentType.Json,
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
  };
  userController = {
    /**
     * No description
     *
     * @tags user-controller
     * @name UserJoin
     * @request POST:/api/users/join
     */
    userJoin: (data: UserJoinRequest, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseUserJoinResponse, any>({
        path: `/api/users/join`,
        method: "POST",
        body: data,
        type: ContentType.Json,
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
      this.request<ApiSuccessResponseUserMemberResponse, any>({
        path: `/api/users/me`,
        method: "GET",
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
      this.request<ApiSuccessResponsePublisherJoinResponse, any>({
        path: `/api/publishers/join`,
        method: "POST",
        body: data,
        type: ContentType.Json,
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
      this.request<ApiSuccessResponsePublisherMemberResponse, any>({
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
  adminController = {
    /**
     * No description
     *
     * @tags admin-controller
     * @name AcceptPublisher
     * @request POST:/api/admin/publishers/{id}/accept
     */
    acceptPublisher: (id: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseBoolean, any>({
        path: `/api/admin/publishers/${id}/accept`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags admin-controller
     * @name UploadFile
     * @request POST:/api/admin/books/upload
     */
    uploadFile: (
      query: {
        request: EbookUploadRequest;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiSuccessResponseString, any>({
        path: `/api/admin/books/upload`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags admin-controller
     * @name FetchPendingList
     * @request GET:/api/admin/publishers/pending
     */
    fetchPendingList: (params: RequestParams = {}) =>
      this.request<ApiSuccessResponseListPublisherInfoResponse, any>({
        path: `/api/admin/publishers/pending`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags admin-controller
     * @name GetBooks
     * @request GET:/api/admin/books
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
      this.request<ApiSuccessResponseEbookListResponse, any>({
        path: `/api/admin/books`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags admin-controller
     * @name DownloadFile
     * @request GET:/api/admin/books/{ebookId}
     */
    downloadFile: (ebookId: number, params: RequestParams = {}) =>
      this.request<ApiSuccessResponseEbookDownloadResponse, any>({
        path: `/api/admin/books/${ebookId}`,
        method: "GET",
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

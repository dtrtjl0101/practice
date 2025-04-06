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
  nickname: string;
  username: string;
  password: string;
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

export interface PublisherJoinResponse {
  /** @format int64 */
  id?: number;
  accessToken?: string;
  publisherName?: string;
  username?: string;
  role?: string;
  isAccepted?: boolean;
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

export interface UserMemberResponse {
  /** @format int64 */
  id?: number;
  nickname?: string;
  username?: string;
  role?: string;
}

export interface PublisherMemberResponse {
  /** @format int64 */
  id?: number;
  publisherName?: string;
  username?: string;
  role?: string;
  isAccepted?: boolean;
}

export interface PublisherInfoResponse {
  /** @format int64 */
  id?: number;
  publisherName?: string;
  /** @format date-time */
  createdAt?: string;
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

export interface EbookListResponse {
  books?: EbookResponse[];
  /** @format int32 */
  currentPage?: number;
  /** @format int64 */
  totalItems?: number;
  /** @format int32 */
  totalPages?: number;
}

export interface EbookResponse {
  /** @format int64 */
  id?: number;
  title?: string;
  author?: string;
  description?: string;
  /** @format int64 */
  size?: number;
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
  public baseUrl: string = "http://ec2-3-37-230-34.ap-northeast-2.compute.amazonaws.com:8080";
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
 * @baseUrl http://ec2-3-37-230-34.ap-northeast-2.compute.amazonaws.com:8080
 *
 * 책잇 API 명세서
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags user-controller
     * @name UserJoin
     * @request POST:/api/users/join
     */
    userJoin: (data: UserJoinRequest, params: RequestParams = {}) =>
      this.request<UserJoinResponse, any>({
        path: `/api/users/join`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags publisher-controller
     * @name PublisherJoin
     * @request POST:/api/publishers/join
     */
    publisherJoin: (data: PublisherJoinRequest, params: RequestParams = {}) =>
      this.request<PublisherJoinResponse, any>({
        path: `/api/publishers/join`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags admin-controller
     * @name AcceptPublisher
     * @request POST:/api/admin/publishers/{id}/accept
     */
    acceptPublisher: (id: number, params: RequestParams = {}) =>
      this.request<boolean, any>({
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
      this.request<string, any>({
        path: `/api/admin/books/upload`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags main-controller
     * @name MainApi
     * @request GET:/api
     */
    mainApi: (params: RequestParams = {}) =>
      this.request<string, any>({
        path: `/api`,
        method: "GET",
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
      this.request<UserMemberResponse, any>({
        path: `/api/users/me`,
        method: "GET",
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
      this.request<PublisherMemberResponse, any>({
        path: `/api/publishers/me`,
        method: "GET",
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
      this.request<PublisherInfoResponse[], any>({
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
      query: {
        pageable: Pageable;
      },
      params: RequestParams = {},
    ) =>
      this.request<EbookListResponse, any>({
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
      this.request<EbookDownloadResponse, any>({
        path: `/api/admin/books/${ebookId}`,
        method: "GET",
        ...params,
      }),
  };
}

import { ENV } from "../env";

export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";
export type BaseResponseBody<D, E = string> =
  | {
      isSuccessful: true;
      data: D;
    }
  | {
      isSuccessful: false;
      error: E;
    };

type ApiSpec = {
  join: {
    request: {
      username: string;
      password: string;
    };
    response: BaseResponseBody<
      {
        authToken: string;
      },
      string
    >;
  };
  login: {
    request: {
      asd: string;
    };
    response: BaseResponseBody<undefined, string>;
  };
};

export type ApiPath = keyof ApiSpec;
export type ApiRequestBody<Path extends ApiPath> = ApiSpec[Path]["request"];
export type ApiResponseBody<Path extends ApiPath> = ApiSpec[Path]["response"];

export class ApiBuilder<
  Path extends ApiPath,
  Body = ApiRequestBody<Path>,
  Response_ = ApiResponseBody<Path>,
> {
  private _authToken: string | undefined = undefined;
  private _path: string = "";
  private _method: ApiMethod = "GET";
  private _body: Body | undefined = undefined;

  constructor(path: ApiPath) {
    this._path = path;
  }

  public authToken(authToken: string) {
    this._authToken = authToken;
    return this;
  }

  public method(method: ApiMethod) {
    this._method = method;
    return this;
  }

  public body(body: Body) {
    this._body = body;
    return this;
  }

  public async send() {
    const response = await fetch(`${ENV.CHAEKIT_API_ENDPOINT}/${this._path}`, {
      method: this._method,
      headers: {
        "Content-Type": "application/json",
        ...(this._authToken
          ? { Authorization: `Bearer ${this._authToken}` }
          : {}),
      },
      ...(this._body ? { body: JSON.stringify(this._body) } : {}),
    });

    if (!response.ok) {
      return {
        isSuccessful: false,
        error: await response.text(),
      } as Response_;
    }

    return {
      isSuccessful: true,
      error: await response.json(),
    } as Response_;
  }
}

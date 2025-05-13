import { getDefaultStore } from "jotai";
import { ENV } from "../env";
import { Api, HttpResponse } from "./api.gen";
import State from "../states";

export type UnsafeApiResponseBody = {
  isSuccessful?: boolean;
  data?: unknown;
  error?: unknown;
};

type SafeApiResponseBody<D, E> =
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

export async function wrapApiResponse<
  R extends HttpResponse<UnsafeApiResponseBody>,
  SafeBody = SafeApiResponseBody<
    NonNullable<R["data"]["data"]>,
    NonNullable<R["data"]["error"]>
  >,
>(response: Promise<R>): Promise<SafeBody> {
  const data: UnsafeApiResponseBody = await response
    .then(async (response) => {
      const data: UnsafeApiResponseBody | undefined =
        response.data ||
        (await response.json().catch((error) => {
          console.error("Failed to parse JSON", error);
          return undefined;
        }));

      if (data) {
        return data;
      }

      return {
        isSuccessful: false,
        error: "NO_DATA",
        errorCode: "NO_DATA",
        errorMessage: "No data received from server.",
      };
    })
    .catch(async (error: R) => {
      return await error.json();
    });

  if (typeof data.isSuccessful === "boolean") {
    if (!data.isSuccessful) {
      if ((data as any).errorCode === "EXPIRED_ACCESS_TOKEN") {
        getDefaultStore().set(
          State.Auth.refreshState,
          State.Auth.RefreshState.NEED_REFRESH
        );
      }
      console.error(data);
    }
    return data as unknown as SafeBody;
  }

  return {
    isSuccessful: false,
    error: "UNKNOWN_ERROR",
    errorCode: "UNKNOWN_ERROR",
    errorMessage: "An unknown error occurred.",
  } as SafeBody;
}

const api = new Api<string>({
  baseUrl: ENV.CHAEKIT_API_ENDPOINT,
  baseApiParams: {
    secure: true,
  },
  securityWorker: async (accessToken) => {
    return {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    };
  },
});

const API_CLIENT = api;

export default API_CLIENT;

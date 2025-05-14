import { getDefaultStore } from "jotai";
import { ENV } from "../env";
import { Api } from "./api.gen";
import State from "../states";

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
  onExpiredAccessToken: () => {
    getDefaultStore().set(
      State.Auth.refreshState,
      State.Auth.RefreshState.NEED_REFRESH
    );
  },
});

const API_CLIENT = api;

export default API_CLIENT;

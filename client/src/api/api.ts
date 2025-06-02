import { getDefaultStore } from "jotai";
import { ENV } from "../env";
import { Api } from "./api.gen";
import State from "../states";

const api = new Api<undefined>({
  baseUrl: ENV.CHAEKIT_API_ENDPOINT,
  baseApiParams: {
    secure: true,
  },
  securityWorker: async () => {
    const user = getDefaultStore().get(State.Auth.user);
    console.log(user);
    if (!user) {
      return {};
    }
    const accessToken = user.accessToken;
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

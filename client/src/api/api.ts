import { ENV } from "../env";
import { Api } from "./api.gen";

const api = new Api({
  baseUrl: ENV.CHAEKIT_API_ENDPOINT,
});
const API = api.api;

export default API;

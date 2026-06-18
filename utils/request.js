import axios from "../js_sdk/xtshadow-axios/axios.min";
import store from "../store";
import { paramsToStr, currentPage, tabbarList, acountList } from "./tools";
import Cache from "./cache";
import { TOKEN, BACK_URL } from "../config/cachekey";
import { baseURL } from "../config/app";
import { getWxCode, toLogin, wxMnpLogin } from "./login";

let index = 0;

function checkParams(params) {
  if (typeof params != "object") return params;
  for (let key in params) {
    const value = params[key];
    if (value === null || value === undefined || value === "") {
      delete params[key];
    }
  }
  return params;
}

function getCurrentUserId() {
  const userInfo = store.getters.userInfo || {};
  return userInfo.userId || userInfo.user_id || userInfo.id;
}

function shouldAttachUserId(url = "") {
  return [
    "miniapp/addresses",
    "miniapp/cart",
    "miniapp/orders",
    "miniapp/payments",
    "miniapp/wallet",
    "miniapp/favorites",
    "miniapp/feedback",
    "miniapp/service/tickets",
    "miniapp/eco-applications/merchant-qualification",
    "miniapp/messages",
    "miniapp/points",
    "miniapp/kyc",
    "miniapp/offline-payments",
  ].some((prefix) => url.startsWith(prefix));
}

function shouldAttachUserIdToQuery(url = "", method = "") {
  const normalizedMethod = String(method || "").toUpperCase();
  return normalizedMethod === "GET"
    || url.startsWith("miniapp/addresses")
    || (url.startsWith("miniapp/cart") && ["PUT", "DELETE"].includes(normalizedMethod));
}

function appendParamsToUrl(config) {
  if (!config.params || typeof config.params !== "object") return;
  const query = paramsToStr(config.params);
  if (!query || query === "?") return;
  config.url += config.url.includes("?") ? `&${query.slice(1)}` : query;
  config.params = undefined;
}

function attachUserId(config) {
  const url = config.url || "";
  if (!shouldAttachUserId(url)) return;
  const userId = getCurrentUserId();
  if (!userId) return;

  if (shouldAttachUserIdToQuery(url, config.method)) {
    config.params = config.params || {};
    config.params.userId = config.params.userId || config.params.user_id || userId;
    return;
  }

  config.data = config.data || {};
  if (typeof config.data === "object" && !Array.isArray(config.data)) {
    config.data.userId = config.data.userId || config.data.user_id || userId;
  }
}

const service = axios.create({
  baseURL: `${baseURL}/api/`,
  timeout: 10000,
  header: {
    "content-type": "application/json",
  },
});

// request拦截器
service.interceptors.request.use(
  (config) => {
    config.header = config.header || {};
    config.data = checkParams(config.data);
    config.params = checkParams(config.params);
    attachUserId(config);
    appendParamsToUrl(config);
    const token = config.header.token || Cache.get(TOKEN);
    if (token) {
      config.header.token = token;
      config.header.Authorization = config.header.Authorization || `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Do something with request error
    console.log(error); // for debug
    Promise.reject(error);
  }
);

// response 拦截器
service.interceptors.response.use(
  async (response) => {
    if (response.data) {
      const data = response.data;
      if (data.code === "0" || data.code === 0) {
        data.rawCode = data.code;
        data.code = 1;
        data.msg = data.msg || data.message || "SUCCESS";
      } else if (data.message && !data.msg) {
        data.msg = data.message;
      }

      const { code, show, msg } = data;
      const { route, options } = currentPage();
      if (code == 0 && show && msg) {
        uni.showToast({
          title: msg,
          icon: "none",
        });
      } else if (code == -1) {
        store.commit("LOGOUT");
        //#ifdef MP-WEIXIN
        wxMnpLogin();
        // #endif
        //#ifdef H5 || APP-PLUS
        if (route && !tabbarList.includes(route)) {
          toLogin();
        }
        // #endif
        //#ifdef H5
        if (!acountList.includes(route)) {
          Cache.set(BACK_URL, `/${route}${paramsToStr(options)}`);
        }
        // #endif
      }
    }

    return Promise.resolve(response.data);
  },
  (error) => {
    // tryHideFullScreenLoading()
    console.log(error);
    console.log("err" + error); // for debug
    return Promise.reject(error);
  }
);

export default service;
